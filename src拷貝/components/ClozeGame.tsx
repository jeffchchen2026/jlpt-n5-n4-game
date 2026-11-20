import { ArrowRight, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { VocabEntry } from '../data/types';
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = useMemo(() => {
    const all = [example.cloze.blankWord, ...example.cloze.distractors];
    return shuffleArray(all);
  }, [entry.id, exampleIndex, example]);

  useEffect(() => {
    setSelectedOption(null);
  }, [entry.id, exampleIndex]);

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === example.cloze.blankWord;

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    if (opt === example.cloze.blankWord) {
      onCorrect();
      speakJapanese(example.japanese, { rate: speechRate });
    } else {
      onWrong();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-700">{entry.level}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.pos}</span>
          <span aria-hidden="true">·</span>
          <span>情境句子填空</span>
        </div>
        <SpeakButton
          text={example.japanese}
          label="朗讀整句"
          rate={speechRate}
          size="sm"
        />
      </div>

      <div className="space-y-3 py-2">
        <p className="font-jp text-xl sm:text-2xl leading-relaxed font-medium text-slate-900">
          <span>{example.cloze.before}</span>
          <span
            className={`inline-block min-w-[4.5rem] px-2.5 py-0.5 mx-1 rounded-lg border text-center font-bold transition-colors ${
              !isAnswered
                ? 'bg-slate-100 border-slate-300 text-slate-400'
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
          <p className="font-jp text-sm text-slate-500 leading-relaxed">
            {isAnswered ? (
              example.kana
            ) : (
              <>
                <span>{example.cloze.kanaBefore}</span>
                <span className="inline-block px-1.5 mx-0.5 rounded bg-slate-100 text-slate-400">
                  ＿＿＿
                </span>
                <span>{example.cloze.kanaAfter}</span>
              </>
            )}
          </p>
        )}

        {showTranslation && (
          <p className="text-sm text-slate-600 leading-relaxed flex items-start gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{example.translation}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isTarget = opt === example.cloze.blankWord;
          const isChosen = opt === selectedOption;

          let btnStyle =
            'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 hover:border-slate-300';
          if (isAnswered) {
            if (isTarget) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
            } else if (isChosen) {
              btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
            } else {
              btnStyle = 'bg-white border-slate-100 text-slate-400';
            }
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
              className={`min-h-[54px] px-4 py-3 rounded-xl border text-base sm:text-lg font-jp font-medium flex items-center justify-between gap-2 transition-colors active:scale-[0.99] cursor-pointer disabled:cursor-default ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && isTarget && (
                <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>正確</span>
                </span>
              )}
              {isAnswered && isChosen && !isTarget && (
                <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-rose-700 shrink-0">
                  <XCircle className="w-4 h-4" />
                  <span>誤答</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="pt-3 border-t border-slate-200 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-jp text-lg font-bold text-slate-900">{entry.kanji}</span>
                {showKana && entry.kanji !== entry.kana && (
                  <span className="font-jp text-sm text-slate-600">{entry.kana}</span>
                )}
                <span className="text-sm font-medium text-blue-700">{entry.meaning}</span>
              </div>
              <SpeakButton
                text={entry.kana}
                label="單字發音"
                rate={speechRate}
                size="sm"
              />
            </div>

            <div className="text-xs text-slate-500">
              <span>情境小卡</span>
              <span aria-hidden="true"> · </span>
              <span>{entry.level}</span>
              <span aria-hidden="true"> · </span>
              <span>{entry.pos}</span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{entry.usageNote}</p>

            {!showTranslation && (
              <p className="text-sm text-slate-600 pt-1 border-t border-slate-200/70">
                中文翻譯：{example.translation}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
          >
            <span>{isReviewMode ? '下一道複習題' : '下一題'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
