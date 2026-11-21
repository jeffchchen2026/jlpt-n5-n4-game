import { CheckCheck, ChevronDown, ChevronUp, Languages, RotateCcw, SlidersHorizontal, Type, Volume2 } from 'lucide-react';
import { useState } from 'react';
import {
  ALL_PARTS_OF_SPEECH,
  GameMode,
  LevelFilter,
  PartOfSpeech,
  PosFilter,
  VocabUnitMeta,
  WordProgress,
} from '../data/types';
import { getUnitMasterySummary, UnitMasterySummary } from '../utils/storage';

interface StudyControlsProps {
  gameMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  levelFilter: LevelFilter;
  onSelectLevel: (level: LevelFilter) => void;
  unitFilter: string;
  onSelectUnit: (unitId: string) => void;
  availableUnits: VocabUnitMeta[];
  posFilter: PosFilter;
  onSelectPos: (pos: PosFilter) => void;
  posCounts: Partial<Record<PartOfSpeech, number>>;
  onlyUnmastered: boolean;
  onToggleOnlyUnmastered: () => void;
  wordProgress: Record<string, WordProgress>;
  filteredMastery: UnitMasterySummary;
  onResetFilteredProgress: () => void;
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

const LEVELS: { id: LevelFilter; label: string; shortLabel: string }[] = [
  { id: 'ALL', label: '全部 N5+N4', shortLabel: '全部' },
  { id: 'N5', label: '只練 N5', shortLabel: 'N5' },
  { id: 'N4', label: '只練 N4', shortLabel: 'N4' },
];

export function StudyControls({
  gameMode,
  onSelectMode,
  levelFilter,
  onSelectLevel,
  unitFilter,
  onSelectUnit,
  availableUnits,
  posFilter,
  onSelectPos,
  posCounts,
  onlyUnmastered,
  onToggleOnlyUnmastered,
  wordProgress,
  filteredMastery,
  onResetFilteredProgress,
  showKana,
  onToggleKana,
  showTranslation,
  onToggleTranslation,
  isReviewingMistakes,
  reviewRemainingCount,
  onExitMistakeReview,
  onOpenSpeechSettings,
}: StudyControlsProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeUnitLabel =
    unitFilter === 'ALL'
      ? '全部單元'
      : availableUnits.find((u) => u.id === unitFilter)?.label.split('・')[0] ?? '指定單元';

  return (
    <div className="space-y-2 sm:space-y-3">
      {isReviewingMistakes ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          <div className="text-sm sm:text-base text-amber-950">
            <span className="font-bold">錯題複習模式</span>
            <span className="mx-1.5 text-amber-700" aria-hidden="true">·</span>
            <span className="font-mono-num">待複習 {reviewRemainingCount} 題（+5 分）</span>
          </div>
          <button
            type="button"
            onClick={onExitMistakeReview}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-sm font-semibold text-amber-950 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>返回練習</span>
          </button>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label="遊戲模式切換"
          className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl"
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
                className={`min-h-[40px] sm:min-h-[44px] px-1.5 sm:px-2 py-1.5 rounded-lg text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{m.label}</span>
                <span className="hidden sm:inline font-mono-num text-xs opacity-75">
                  {m.pts}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {!isReviewingMistakes && (
          <div
            role="group"
            aria-label="JLPT 程度篩選"
            className="inline-flex items-center gap-0.5 p-0.5 sm:p-1 bg-white border border-slate-200 rounded-xl"
          >
            {LEVELS.map((lv) => {
              const active = levelFilter === lv.id;
              return (
                <button
                  key={lv.id}
                  type="button"
                  onClick={() => onSelectLevel(lv.id)}
                  className={`min-h-[38px] sm:min-h-[42px] px-2.5 sm:px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="sm:hidden">{lv.shortLabel}</span>
                  <span className="hidden sm:inline">{lv.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="inline-flex items-center gap-1 sm:gap-1.5 ml-auto">
          <button
            type="button"
            onClick={onToggleKana}
            aria-pressed={showKana}
            className={`min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl border text-sm font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showKana
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">假名</span>
            <span className="hidden sm:inline">{showKana ? '假名：開' : '假名：關'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTranslation}
            aria-pressed={showTranslation}
            className={`min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl border text-sm font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showTranslation
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">中文</span>
            <span className="hidden sm:inline">{showTranslation ? '中文：開' : '中文：關'}</span>
          </button>

          {onOpenSpeechSettings && (
            <button
              type="button"
              onClick={onOpenSpeechSettings}
              aria-label="語音設定"
              className="lg:hidden min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span>語音</span>
            </button>
          )}
        </div>
      </div>

      {!isReviewingMistakes && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Mobile Compact Summary Toggle Bar */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className="md:hidden w-full min-h-[42px] px-3 py-2 flex items-center justify-between gap-2 text-left bg-white hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-sm text-slate-800 min-w-0 truncate">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold truncate">
                {activeUnitLabel}
                {posFilter !== 'ALL' ? ` · ${posFilter}` : ''}
                {onlyUnmastered ? ' · 未掌握' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-sm">
              <span className="font-mono-num font-bold text-blue-700">
                {filteredMastery.mastered}/{filteredMastery.total}
              </span>
              <span className="inline-flex items-center gap-0.5 text-slate-700 font-medium">
                <span>範圍</span>
                {mobileFiltersOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </div>
          </button>

          {/* Filter Details: Collapsible on mobile, always visible on md+ */}
          <div
            className={`${
              mobileFiltersOpen ? 'block border-t border-slate-100' : 'hidden md:block'
            } p-3 sm:p-3.5 space-y-2.5 sm:space-y-3`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <label htmlFor="unit-filter-select" className="sr-only">
                  單元篩選
                </label>
                <select
                  id="unit-filter-select"
                  value={unitFilter}
                  onChange={(e) => onSelectUnit(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">
                    全部單元（共 {availableUnits.reduce((sum, u) => sum + u.entries.length, 0)} 字）
                  </option>
                  {availableUnits.map((unit) => {
                    const summary = getUnitMasterySummary(unit.entries, wordProgress);
                    return (
                      <option key={unit.id} value={unit.id}>
                        {unit.label}（{summary.mastered}/{summary.total} 已掌握）
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:col-span-6 gap-2.5">
                <div>
                  <label htmlFor="pos-filter-select" className="sr-only">
                    詞性篩選
                  </label>
                  <select
                    id="pos-filter-select"
                    value={posFilter}
                    onChange={(e) => onSelectPos(e.target.value as PosFilter)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">全部詞性</option>
                    {ALL_PARTS_OF_SPEECH.map((pos) => {
                      const count = posCounts[pos] ?? 0;
                      if (count === 0) return null;
                      return (
                        <option key={pos} value={pos}>
                          {pos}（{count}）
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onToggleOnlyUnmastered}
                  aria-pressed={onlyUnmastered}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    onlyUnmastered
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <CheckCheck className="w-4 h-4 shrink-0" />
                  <span>只練未掌握</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>範圍進度</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">
                    已練習 {filteredMastery.practiced}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num font-bold text-slate-900">
                    已掌握 {filteredMastery.mastered}/{filteredMastery.total} 字
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono-num font-bold text-blue-700">
                    {filteredMastery.percent}%
                  </span>
                  {filteredMastery.practiced > 0 && (
                    <button
                      type="button"
                      onClick={onResetFilteredProgress}
                      className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer whitespace-nowrap"
                    >
                      重設進度
                    </button>
                  )}
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${filteredMastery.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
