import { ArrowRight, CheckCircle2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { VocabEntry } from '../data/types';
import { speakJapanese } from '../utils/speech';
import { SpeakButton } from './SpeakButton';

interface ScrambleGameProps {
  entry: VocabEntry;
  exampleIndex: number;
  showKana: boolean;
  showTranslation: boolean;
  speechRate: number;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}

interface ChunkToken {
  idx: number;
  text: string;
}

function shuffleTokens(chunks: string[]): ChunkToken[] {
  const tokens = chunks.map((text, idx) => ({ idx, text }));
  if (tokens.length <= 1) return tokens;
  const arr = [...tokens];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure order is actually shuffled if possible
  const sameOrder = arr.every((t, i) => t.idx === i);
  if (sameOrder && arr.length > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export function ScrambleGame({
  entry,
  exampleIndex,
  showKana,
  showTranslation,
  speechRate,
  onCorrect,
  onWrong,
  onNext,
}: ScrambleGameProps) {
  const example = entry.examples[exampleIndex] ?? entry.examples[0];
  const [phase, setPhase] = useState<'preview' | 'playing' | 'solved'>('preview');
  const [placedIds, setPlacedIds] = useState<number[]>([]);
  const [hasWrongAttempt, setHasWrongAttempt] = useState(false);
  const [scoredThisCard, setScoredThisCard] = useState(false);

  const shuffledTokens = useMemo(
    () => shuffleTokens(example.scramble.chunks),
    [entry.id, exampleIndex, example]
  );

  useEffect(() => {
    setPhase('preview');
    setPlacedIds([]);
    setHasWrongAttempt(false);
    setScoredThisCard(false);
  }, [entry.id, exampleIndex]);

  const tokenMap = useMemo(() => {
    const map = new Map<number, ChunkToken>();
    shuffledTokens.forEach((t) => map.set(t.idx, t));
    return map;
  }, [shuffledTokens]);

  const allPlaced = placedIds.length === example.scramble.chunks.length;

  const handlePickToken = (idx: number) => {
    if (phase !== 'playing') return;
    if (placedIds.includes(idx)) return;
    setHasWrongAttempt(false);
    setPlacedIds((prev) => [...prev, idx]);
  };

  const handleRemoveToken = (idx: number) => {
    if (phase !== 'playing') return;
    setHasWrongAttempt(false);
    setPlacedIds((prev) => prev.filter((id) => id !== idx));
  };

  const handleClearTray = () => {
    if (phase !== 'playing') return;
    setHasWrongAttempt(false);
    setPlacedIds([]);
  };

  const handleCheckAnswer = () => {
    if (!allPlaced || phase !== 'playing') return;
    const builtSentence = placedIds.map((id) => tokenMap.get(id)?.text ?? '').join('');
    const expectedSentence = example.scramble.chunks.join('');

    if (builtSentence === expectedSentence) {
      setPhase('solved');
      if (!scoredThisCard) {
        setScoredThisCard(true);
        onCorrect();
      }
      speakJapanese(example.japanese, { rate: speechRate });
    } else {
      setHasWrongAttempt(true);
      if (!scoredThisCard) {
        onWrong();
      }
    }
  };

  const handleRevealAnswer = () => {
    setPlacedIds(example.scramble.chunks.map((_, i) => i));
    setHasWrongAttempt(false);
    setPhase('solved');
    setScoredThisCard(true);
    speakJapanese(example.japanese, { rate: speechRate });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-bold text-blue-700">{entry.level}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.pos}</span>
          <span aria-hidden="true">·</span>
          <span>句子重組</span>
        </div>
        <SpeakButton text={entry.kana} label="單字發音" rate={speechRate} size="sm" />
      </div>

      {phase === 'preview' && (
        <div className="space-y-3 sm:space-y-4 py-1">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-2.5">
            <div className="space-y-1">
              <div className="font-jp text-2xl sm:text-3xl font-bold text-slate-900">{entry.kanji}</div>
              {showKana && entry.kanji !== entry.kana && (
                <div className="font-jp text-base sm:text-lg text-slate-700">{entry.kana}</div>
              )}
              <div className="text-lg sm:text-xl font-semibold text-blue-700 pt-0.5">{entry.meaning}</div>
            </div>

            <div className="pt-2.5 border-t border-slate-200 space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-600">使用時機與語氣摘要</div>
              <p className="text-sm sm:text-base text-slate-800 leading-snug">{entry.usageNote}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPhase('playing')}
            className="w-full min-h-[48px] sm:min-h-[52px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>開始重組句子</span>
          </button>
        </div>
      )}

      {phase !== 'preview' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-1.5">
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-slate-600">目標</span>
              <span className="font-jp text-lg sm:text-xl font-bold text-slate-900">{entry.kanji}</span>
              {showKana && entry.kanji !== entry.kana && (
                <span className="font-jp text-sm sm:text-base text-slate-600">{entry.kana}</span>
              )}
              <span className="text-sm sm:text-base font-semibold text-blue-700">{entry.meaning}</span>
            </div>
            {showTranslation && (
              <p className="text-sm sm:text-base text-slate-700 w-full leading-snug">
                中文提示：{example.translation}
              </p>
            )}
          </div>

          {/* Sentence Assembly Tray */}
          <div
            aria-label="句子組合區"
            className={`min-h-[64px] sm:min-h-[76px] p-2.5 sm:p-3 rounded-xl border-2 border-dashed transition-colors flex flex-wrap items-center gap-1.5 sm:gap-2 ${
              phase === 'solved'
                ? 'bg-emerald-50/70 border-emerald-400 border-solid'
                : hasWrongAttempt
                  ? 'bg-rose-50/60 border-rose-300'
                  : 'bg-slate-50 border-slate-300'
            }`}
          >
            {placedIds.length === 0 ? (
              <span className="text-sm sm:text-base text-slate-500">請依序點選下方詞彙方塊來組成句子…</span>
            ) : (
              placedIds.map((id) => {
                const token = tokenMap.get(id);
                if (!token) return null;
                return (
                  <button
                    key={`placed-${id}`}
                    type="button"
                    disabled={phase === 'solved'}
                    onClick={() => handleRemoveToken(id)}
                    className={`min-h-[42px] sm:min-h-[46px] px-3 py-1.5 rounded-xl border font-jp text-base sm:text-lg font-medium transition-colors cursor-pointer disabled:cursor-default ${
                      phase === 'solved'
                        ? 'bg-white border-emerald-300 text-emerald-950'
                        : 'bg-white border-blue-300 text-slate-900 hover:bg-rose-50 hover:border-rose-300'
                    }`}
                  >
                    {token.text}
                  </button>
                );
              })
            )}
          </div>

          {hasWrongAttempt && phase === 'playing' && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 font-medium">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>語順還不太對喔，請再試一次！</span>
              </div>
              <button
                type="button"
                onClick={handleRevealAnswer}
                className="text-sm font-semibold underline underline-offset-4 text-rose-900 hover:text-rose-950 cursor-pointer"
              >
                查看正確句子
              </button>
            </div>
          )}

          {phase === 'playing' && (
            <>
              <div className="flex flex-wrap gap-2" aria-label="可用詞彙方塊">
                {shuffledTokens.map((token) => {
                  const used = placedIds.includes(token.idx);
                  return (
                    <button
                      key={`pool-${token.idx}`}
                      type="button"
                      disabled={used}
                      onClick={() => handlePickToken(token.idx)}
                      className={`min-h-[44px] sm:min-h-[48px] px-3 sm:px-3.5 py-1.5 rounded-xl border font-jp text-base sm:text-lg font-medium transition-all active:scale-[0.97] cursor-pointer ${
                        used
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                          : 'bg-white border-slate-300 text-slate-900 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {token.text}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleClearTray}
                  disabled={placedIds.length === 0}
                  className="col-span-1 min-h-[46px] sm:min-h-[50px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-medium text-base flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>清空</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={!allPlaced}
                  className="col-span-2 min-h-[46px] sm:min-h-[50px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer"
                >
                  確認句子
                </button>
              </div>
            </>
          )}

          {phase === 'solved' && (
            <div className="pt-2.5 sm:pt-3 border-t border-slate-200 space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>完成句子！</span>
                  </div>
                  <SpeakButton
                    text={example.japanese}
                    label="朗讀整句"
                    rate={speechRate}
                    size="sm"
                  />
                </div>

                <div className="space-y-1">
                  <p className="font-jp text-lg sm:text-xl font-bold text-slate-900">{example.japanese}</p>
                  {showKana && <p className="font-jp text-sm sm:text-base text-slate-700">{example.kana}</p>}
                  <p className="text-sm sm:text-base text-slate-800">{example.translation}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700">句型・助詞重點</div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    {example.scramble.grammarTip}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNext}
                className="w-full min-h-[48px] sm:min-h-[52px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
              >
                <span>下一題</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
