import { Languages, RotateCcw, Type, Volume2 } from 'lucide-react';
import { GameMode, LevelFilter } from '../data/types';

interface StudyControlsProps {
  gameMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  levelFilter: LevelFilter;
  onSelectLevel: (level: LevelFilter) => void;
  showKana: boolean;
  onToggleKana: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  isReviewingMistakes: boolean;
  reviewRemainingCount: number;
  onExitMistakeReview: () => void;
  onOpenSpeechSettings?: () => void;
}

const MODES: { id: GameMode; label: string; pts: string }[] = [
  { id: 'cloze', label: '情境填空', pts: '+10' },
  { id: 'scramble', label: '句子重組', pts: '+15' },
  { id: 'dialogue', label: '情境二選一', pts: '+10' },
];

const LEVELS: { id: LevelFilter; label: string }[] = [
  { id: 'ALL', label: '全部 N5+N4' },
  { id: 'N5', label: '只練 N5' },
  { id: 'N4', label: '只練 N4' },
];

export function StudyControls({
  gameMode,
  onSelectMode,
  levelFilter,
  onSelectLevel,
  showKana,
  onToggleKana,
  showTranslation,
  onToggleTranslation,
  isReviewingMistakes,
  reviewRemainingCount,
  onExitMistakeReview,
  onOpenSpeechSettings,
}: StudyControlsProps) {
  return (
    <div className="space-y-3">
      {isReviewingMistakes ? (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="text-sm text-amber-900">
            <span className="font-semibold">錯題複習模式</span>
            <span className="mx-1.5 text-amber-600" aria-hidden="true">·</span>
            <span className="font-mono-num">待複習 {reviewRemainingCount} 題（答對 +5 分）</span>
          </div>
          <button
            type="button"
            onClick={onExitMistakeReview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>返回一般練習</span>
          </button>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label="遊戲模式切換"
          className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl"
        >
          {MODES.map((m) => {
            const active = gameMode === m.id;
            return (
              <button
                key={m.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onSelectMode(m.id)}
                className={`min-h-[44px] px-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{m.label}</span>
                <span className="hidden sm:inline font-mono-num text-[11px] opacity-75">
                  {m.pts}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {!isReviewingMistakes && (
          <div
            role="group"
            aria-label="JLPT 程度篩選"
            className="inline-flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl"
          >
            {LEVELS.map((lv) => {
              const active = levelFilter === lv.id;
              return (
                <button
                  key={lv.id}
                  type="button"
                  onClick={() => onSelectLevel(lv.id)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {lv.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={onToggleKana}
            aria-pressed={showKana}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showKana
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{showKana ? '假名：開' : '假名：關'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTranslation}
            aria-pressed={showTranslation}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showTranslation
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{showTranslation ? '中文：開' : '中文：關'}</span>
          </button>

          {onOpenSpeechSettings && (
            <button
              type="button"
              onClick={onOpenSpeechSettings}
              aria-label="語音設定"
              className="lg:hidden min-h-[38px] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>語音</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
