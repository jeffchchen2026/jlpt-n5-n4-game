import { ArrowRight, CheckCircle2, MessageCircle, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { VocabEntry } from '../data/types';
import { speakJapanese } from '../utils/speech';
import { SpeakButton } from './SpeakButton';

interface DialogueGameProps {
  entry: VocabEntry;
  showKana: boolean;
  showTranslation: boolean;
  speechRate: number;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}

interface ChoiceItem {
  isCorrect: boolean;
  ja: string;
  kana: string;
  zh: string;
}

export function DialogueGame({
  entry,
  showKana,
  showTranslation,
  speechRate,
  onCorrect,
  onWrong,
  onNext,
}: DialogueGameProps) {
  const { dialogue } = entry;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const choices: ChoiceItem[] = useMemo(() => {
    const firstIsCorrect = Math.random() >= 0.5;
    const correctItem: ChoiceItem = { isCorrect: true, ...dialogue.correctOption };
    const wrongItem: ChoiceItem = { isCorrect: false, ...dialogue.wrongOption };
    return firstIsCorrect ? [correctItem, wrongItem] : [wrongItem, correctItem];
  }, [entry.id, dialogue]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [entry.id]);

  const isAnswered = selectedIndex !== null;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIndex(idx);
    const picked = choices[idx];
    if (picked.isCorrect) {
      onCorrect();
    } else {
      onWrong();
    }
    speakJapanese(dialogue.correctOption.ja, { rate: speechRate });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-700">{entry.level}</span>
          <span aria-hidden="true">·</span>
          <span>{dialogue.situation}場景</span>
          <span aria-hidden="true">·</span>
          <span>情境二選一</span>
        </div>
        <SpeakButton text={dialogue.promptJa} label="聽對方說" rate={speechRate} size="sm" />
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{dialogue.sceneDescription}</p>

      {/* Speaker Bubble */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>對方的話</span>
        </div>
        <p className="font-jp text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
          {dialogue.promptJa}
        </p>
        {showKana && <p className="font-jp text-sm text-slate-500">{dialogue.promptKana}</p>}
        {showTranslation && <p className="text-sm text-slate-600">{dialogue.promptZh}</p>}
      </div>

      {/* Two Large Thumb-Friendly Choice Buttons */}
      <div className="space-y-3" role="group" aria-label="選擇回應">
        {choices.map((choice, idx) => {
          const isChosen = selectedIndex === idx;
          let cardClass =
            'bg-white border-slate-300 text-slate-900 hover:bg-blue-50/50 hover:border-blue-400';

          if (isAnswered) {
            if (choice.isCorrect) {
              cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-950';
            } else if (isChosen) {
              cardClass = 'bg-rose-50 border-rose-400 text-rose-950';
            } else {
              cardClass = 'bg-slate-50 border-slate-200 text-slate-400';
            }
          }

          return (
            <button
              key={choice.ja}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(idx)}
              className={`w-full min-h-[64px] p-4 rounded-xl border text-left transition-colors active:scale-[0.99] cursor-pointer disabled:cursor-default space-y-1 ${cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-jp text-base sm:text-lg font-semibold leading-snug">
                  {choice.ja}
                </span>
                {isAnswered && choice.isCorrect && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>自然適切</span>
                  </span>
                )}
                {isAnswered && isChosen && !choice.isCorrect && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4" />
                    <span>不恰當</span>
                  </span>
                )}
              </div>

              {showKana && <div className="font-jp text-xs opacity-80">{choice.kana}</div>}
              {isAnswered && (
                <div className="text-sm opacity-90 pt-1 border-t border-black/10">
                  {choice.zh}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="pt-3 border-t border-slate-200 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-jp text-base font-bold text-slate-900">{entry.kanji}</span>
                {showKana && entry.kanji !== entry.kana && (
                  <span className="font-jp text-sm text-slate-500">{entry.kana}</span>
                )}
                <span className="text-sm font-medium text-blue-700">{entry.meaning}</span>
              </div>
              <SpeakButton
                text={dialogue.correctOption.ja}
                label="朗讀正確回應"
                rate={speechRate}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-blue-700">使用時機與禮貌程度說明</div>
              <p className="text-sm text-slate-700 leading-relaxed">{dialogue.politenessNote}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
          >
            <span>下一題</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
