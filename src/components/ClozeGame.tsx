import { ArrowRight, BookOpen, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  ClozeOptionInfo,
  getBlankWordKana,
  resolveClozeOptionInfo,
} from '../data/clozeGlossary';
import { VocabEntry } from '../data/types';
import { VOCAB_BY_KANJI } from '../data/vocab';
import { speakJapanese } from '../utils/speech';
import { SpeakButton } from './SpeakButton';

interface ClozeGameProps {
  entry: VocabEntry;
  exampleIndex: number;
  showKana: boolean;
  showTranslation: boolean;
  speechRate: number;
  isReviewMode?: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function ClozeGame({
  entry,
  exampleIndex,
  showKana,
  showTranslation,
  speechRate,
  isReviewMode = false,
  onCorrect,
  onWrong,
  onNext,
}: ClozeGameProps) {
  const example = entry.examples[exampleIndex] ?? entry.examples[0];
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null);

  const options: ClozeOptionInfo[] = useMemo(() => {
    const targetOption: ClozeOptionInfo = {
      surface: example.cloze.blankWord,
      kana: getBlankWordKana(example),
      meaning: entry.meaning,
    };
    const distractorOptions = example.cloze.distractors.map((d) =>
      resolveClozeOptionInfo(d, VOCAB_BY_KANJI)
    );
    return shuffleArray([targetOption, ...distractorOptions]);
  }, [entry.id, entry.meaning, exampleIndex, example]);

  useEffect(() => {
    setSelectedSurface(null);
  }, [entry.id, exampleIndex]);

  const isAnswered = selectedSurface !== null;
  const isCorrect = selectedSurface === example.cloze.blankWord;

  const handleSelect = (opt: ClozeOptionInfo) => {
    if (isAnswered) return;
    setSelectedSurface(opt.surface);
    if (opt.surface === example.cloze.blankWord) {
      onCorrect();
      speakJapanese(example.japanese, { rate: speechRate });
    } else {
      onWrong();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-bold text-blue-700">{entry.level}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.pos}</span>
          <span aria-hidden="true">·</span>
          <span>情境填空</span>
        </div>
        <SpeakButton
          text={example.japanese}
          label="朗讀整句"
          rate={speechRate}
          size="sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2 py-0.5">
        <p className="font-jp text-[19px] sm:text-2xl leading-snug font-medium text-slate-900">
          <span>{example.cloze.before}</span>
          <span
            className={`inline-block min-w-[3.75rem] sm:min-w-[4.5rem] px-2 py-0.5 mx-1 rounded-lg border text-center font-bold transition-colors ${
              !isAnswered
                ? 'bg-slate-100 border-slate-300 text-slate-500'
                : isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-blue-50 border-blue-300 text-blue-800'
            }`}
          >
            {isAnswered ? example.cloze.blankWord : '＿＿＿'}
          </span>
          <span>{example.cloze.after}</span>
        </p>

        {showKana && (
          <p className="font-jp text-sm sm:text-base text-slate-700 leading-snug">
            {isAnswered ? (
              example.kana
            ) : (
              <>
                <span>{example.cloze.kanaBefore}</span>
                <span className="inline-block px-1 mx-0.5 rounded bg-slate-100 text-slate-500">
                  ＿＿＿
                </span>
                <span>{example.cloze.kanaAfter}</span>
              </>
            )}
          </p>
        )}

        {showTranslation && (
          <p className="text-sm sm:text-base text-slate-700 leading-snug flex items-start gap-1.5">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 shrink-0 mt-0.5" />
            <span>{example.translation}</span>
          </p>
        )}
      </div>

      {/* Options strictly rendered in kana (no Kanji) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {options.map((opt) => {
          const isTarget = opt.surface === example.cloze.blankWord;
          const isChosen = opt.surface === selectedSurface;

          let btnStyle =
            'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 hover:border-slate-300';
          if (isAnswered) {
            if (isTarget) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
            } else if (isChosen) {
              btnStyle = 'bg-rose-50 border-rose-400 text-rose-950';
            } else {
              btnStyle = 'bg-white border-slate-200 text-slate-500';
            }
          }

          return (
            <button
              key={opt.surface}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
              className={`min-h-[48px] sm:min-h-[54px] px-3 sm:px-4 py-2 rounded-xl border text-[17px] sm:text-lg font-jp font-medium flex items-center justify-between gap-1.5 text-left leading-snug transition-colors active:scale-[0.99] cursor-pointer disabled:cursor-default ${btnStyle}`}
            >
              <span className="break-all">{opt.kana}</span>
              {isAnswered && isTarget && (
                <span className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-sans font-semibold text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">正確</span>
                </span>
              )}
              {isAnswered && isChosen && !isTarget && (
                <span className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-sans font-semibold text-rose-700 shrink-0">
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">誤答</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Explanation Section: Target word + Grammar point + 3 distractor meanings */}
      {isAnswered && (
        <div className="pt-2.5 sm:pt-3 border-t border-slate-200 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
            {/* Target word header & usage */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-jp text-[19px] sm:text-2xl font-bold text-slate-900">
                    {entry.kanji}
                  </span>
                  {entry.kanji !== entry.kana && (
                    <span className="font-jp text-[17px] sm:text-xl text-slate-700">
                      {entry.kana}
                    </span>
                  )}
                  <span className="text-[17px] sm:text-xl font-semibold text-blue-700">
                    {entry.meaning}
                  </span>
                </div>
                <SpeakButton
                  text={entry.kana}
                  label="單字發音"
                  rate={speechRate}
                  size="sm"
                />
              </div>

              <p className="text-[17px] sm:text-lg text-slate-800 leading-relaxed">
                {entry.usageNote}
              </p>

              {!showTranslation && (
                <p className="text-[17px] sm:text-lg text-slate-700 pt-1">
                  中文翻譯：{example.translation}
                </p>
              )}
            </div>

            {/* Sentence grammar point */}
            {example.scramble.grammarTip && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg px-3.5 py-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-blue-900">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0" />
                  <span>本句文法重點</span>
                </div>
                <p className="text-[17px] sm:text-lg text-slate-800 leading-relaxed">
                  {example.scramble.grammarTip}
                </p>
              </div>
            )}

            {/* 3 distractor options breakdown (excluding correct answer) */}
            <div className="space-y-2 pt-1.5 border-t border-slate-200/80">
              <p className="text-base sm:text-lg font-bold text-slate-800">
                其他三個選項說明
              </p>
              <div className="grid grid-cols-1 gap-2">
                {options
                  .filter((opt) => opt.surface !== example.cloze.blankWord)
                  .map((opt) => {
                    const isChosen = opt.surface === selectedSurface;

                    return (
                      <div
                        key={opt.surface}
                        className={`rounded-lg border px-3 py-2.5 leading-snug flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 ${
                          isChosen
                            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex flex-wrap items-baseline gap-1.5 font-jp">
                          <span className="text-[18px] sm:text-xl font-bold text-slate-900">
                            {opt.kana}
                          </span>
                          {opt.surface !== opt.kana && (
                            <span className="text-base sm:text-lg text-slate-600">
                              （{opt.surface}）
                            </span>
                          )}
                          {isChosen && (
                            <span className="text-sm sm:text-base font-sans font-bold text-rose-700">
                              · 誤選
                            </span>
                          )}
                        </div>
                        <p className="text-[17px] sm:text-lg text-slate-800 font-medium">
                          {opt.meaning}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full min-h-[48px] sm:min-h-[52px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
          >
            <span>{isReviewMode ? '下一道複習題' : '下一題'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
