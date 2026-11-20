import { BookOpenCheck, Check, Play, Trash2 } from 'lucide-react';
import { MistakeItem } from '../data/types';
import { VOCAB_BY_ID } from '../data/vocab';
import { SpeakButton } from './SpeakButton';

interface MistakeNotebookProps {
  mistakes: MistakeItem[];
  showKana: boolean;
  showTranslation: boolean;
  speechRate: number;
  onStartReview: () => void;
  onRemoveMistake: (vocabId: string) => void;
  onClearAll: () => void;
  onGoPlay: () => void;
}

const MODE_LABELS: Record<string, string> = {
  cloze: '情境填空',
  scramble: '句子重組',
  dialogue: '情境二選一',
};

export function MistakeNotebook({
  mistakes,
  showKana,
  showTranslation,
  speechRate,
  onStartReview,
  onRemoveMistake,
  onClearAll,
  onGoPlay,
}: MistakeNotebookProps) {
  const validMistakes = mistakes
    .map((m) => ({ item: m, vocab: VOCAB_BY_ID[m.vocabId] }))
    .filter((pair) => Boolean(pair.vocab));

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">個人錯題本</h2>
          <p className="text-sm text-slate-600">
            答錯的單字與例句會自動儲存於本機。複習答對每題可得 <strong className="font-mono-num text-blue-700">+5</strong> 基礎分（含連擊加成）。
          </p>
        </div>

        {validMistakes.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onStartReview}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>一鍵複習錯題（{validMistakes.length}）</span>
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空</span>
            </button>
          </div>
        )}
      </div>

      {validMistakes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">目前沒有待複習的錯題</h3>
            <p className="text-sm text-slate-600">
              在練習過程中若答錯題目，系統會自動把該單字與例句收錄到這裡，方便隨時複習。
            </p>
          </div>
          <button
            type="button"
            onClick={onGoPlay}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm inline-flex items-center justify-center cursor-pointer"
          >
            前往開始練習
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {validMistakes.map(({ item, vocab }) => {
            const example = vocab.examples[item.exampleIndex] ?? vocab.examples[0];
            return (
              <article
                key={vocab.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">{vocab.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{vocab.pos}</span>
                      <span aria-hidden="true">·</span>
                      <span>誤答 {item.wrongCount} 次</span>
                      <span aria-hidden="true">·</span>
                      <span>{MODE_LABELS[item.lastWrongMode] ?? '練習'}</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
                      <h3 className="font-jp text-2xl font-bold text-slate-900">{vocab.kanji}</h3>
                      {showKana && vocab.kanji !== vocab.kana && (
                        <span className="font-jp text-sm text-slate-500">{vocab.kana}</span>
                      )}
                      <span className="text-base font-semibold text-blue-700">
                        {vocab.meaning}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SpeakButton
                      text={example.japanese}
                      label="朗讀例句"
                      rate={speechRate}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveMistake(vocab.id)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>已熟記</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
                  <p className="font-jp text-base font-medium text-slate-900">
                    {example.japanese}
                  </p>
                  {showKana && <p className="font-jp text-xs text-slate-500">{example.kana}</p>}
                  {showTranslation && (
                    <p className="text-sm text-slate-700">{example.translation}</p>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{vocab.usageNote}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
