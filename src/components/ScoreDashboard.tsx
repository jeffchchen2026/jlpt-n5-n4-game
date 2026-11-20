import { Award, CheckCircle2, Flame, Target, TrendingUp, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DailyRecord, ScoreState } from '../data/types';
import {
  calculateConsecutiveGoalStreak,
  formatFullDateLabel,
  formatShortMonthDay,
  getRecentDailySeries,
  getRecordedDaysHistory,
  getTodayDateKey,
  getTodayRecord,
} from '../utils/storage';

interface ScoreDashboardProps {
  scoreState: ScoreState;
  onUpdateDailyGoal: (goal: number) => void;
}

const PRESET_GOALS = [50, 100, 200];

export function ScoreDashboard({ scoreState, onUpdateDailyGoal }: ScoreDashboardProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14>(7);
  const [customGoalInput, setCustomGoalInput] = useState<string>(String(scoreState.dailyGoal));
  const [selectedDateKey, setSelectedDateKey] = useState<string>(getTodayDateKey());

  const todayRecord = getTodayRecord(scoreState);
  const goalStreak = calculateConsecutiveGoalStreak(scoreState);
  const chartSeries = useMemo(
    () => getRecentDailySeries(scoreState, rangeDays),
    [scoreState, rangeDays]
  );
  const historyList = useMemo(() => getRecordedDaysHistory(scoreState), [scoreState]);

  const selectedDayRecord: DailyRecord = useMemo(() => {
    return (
      chartSeries.find((r) => r.date === selectedDateKey) ??
      historyList.find((r) => r.date === selectedDateKey) ??
      todayRecord
    );
  }, [chartSeries, historyList, selectedDateKey, todayRecord]);

  const maxChartValue = useMemo(() => {
    const maxScore = Math.max(...chartSeries.map((d) => d.totalScore), 0);
    return Math.max(maxScore, scoreState.dailyGoal, 50) * 1.15;
  }, [chartSeries, scoreState.dailyGoal]);

  const progressPct = Math.min(
    100,
    Math.round((todayRecord.totalScore / Math.max(1, scoreState.dailyGoal)) * 100)
  );

  const handleApplyCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(customGoalInput);
    if (!Number.isFinite(parsed) || parsed < 10) return;
    const clamped = Math.min(2000, Math.round(parsed));
    setCustomGoalInput(String(clamped));
    onUpdateDailyGoal(clamped);
  };

  const handleSelectPreset = (preset: number) => {
    setCustomGoalInput(String(preset));
    onUpdateDailyGoal(preset);
  };

  // SVG Chart dimensions (responsive viewBox)
  const svgWidth = 640;
  const svgHeight = 220;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 32;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;
  const goalLineY = padTop + plotH - (scoreState.dailyGoal / maxChartValue) * plotH;

  return (
    <div className="space-y-5">
      {/* KPI Metrics Strip */}
      <section aria-label="核心成績統計" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>今日積分</span>
          </div>
          <div className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900">
            {todayRecord.totalScore}
          </div>
          <div className="text-xs text-slate-500 font-mono-num">
            目標 {scoreState.dailyGoal} 分（{progressPct}%）
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>今日最高連擊</span>
          </div>
          <div className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900">
            {todayRecord.bestCombo}
          </div>
          <div className="text-xs text-slate-500 font-mono-num">
            目前連擊 {scoreState.currentCombo} 題
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>歷史最高連擊</span>
          </div>
          <div className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900">
            {scoreState.bestComboEver}
          </div>
          <div className="text-xs text-slate-500">最高倍率可達 2.0x</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>連續達標天數</span>
          </div>
          <div className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900">
            {goalStreak}
          </div>
          <div className="text-xs text-slate-500">
            {todayRecord.goalReached ? '今日已達標' : '今日挑戰中'}
          </div>
        </div>
      </section>

      {/* Daily Goal Configuration */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">每日目標積分設定</h2>
            <p className="text-xs text-slate-500">設定每天想達成的練習積分，自動儲存於本機。</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
            {todayRecord.goalReached ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>今日已達標</span>
              </span>
            ) : (
              <span className="text-slate-600 font-mono-num">
                還差 {Math.max(0, scoreState.dailyGoal - todayRecord.totalScore)} 分達標
              </span>
            )}
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              todayRecord.goalReached ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {PRESET_GOALS.map((preset) => {
              const active = scoreState.dailyGoal === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`min-h-[42px] px-4 py-2 rounded-xl border text-sm font-mono-num font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preset} 分
                </button>
              );
            })}
          </div>

          <form onSubmit={handleApplyCustomGoal} className="flex items-center gap-2">
            <label htmlFor="custom-goal-input" className="text-xs text-slate-500 whitespace-nowrap">
              自訂目標
            </label>
            <input
              id="custom-goal-input"
              type="number"
              min={10}
              max={2000}
              step={5}
              value={customGoalInput}
              onChange={(e) => setCustomGoalInput(e.target.value)}
              className="w-24 min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
            >
              套用
            </button>
          </form>
        </div>
      </section>

      {/* Score Trend Chart (7 / 14 Days) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">每日得分趨勢圖</h2>
            <p className="text-xs text-slate-500">點擊長條可查看該日完整日期與各模式得分明細</p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRangeDays(7)}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                rangeDays === 7 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              近 7 天
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(14)}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                rangeDays === 14 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              近 14 天
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label={`近 ${rangeDays} 天每日得分趨勢圖`}
          >
            {/* Horizontal subtle grid lines */}
            {[0, 0.5, 1].map((ratio) => {
              const y = padTop + plotH * (1 - ratio);
              const val = Math.round(maxChartValue * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono-num"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Daily Goal Target Dashed Line */}
            <line
              x1={padLeft}
              y1={goalLineY}
              x2={svgWidth - padRight}
              y2={goalLineY}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text
              x={svgWidth - padRight}
              y={Math.max(12, goalLineY - 5)}
              textAnchor="end"
              className="fill-amber-700 text-[10px] font-semibold"
            >
              目標 {scoreState.dailyGoal}
            </text>

            {/* Interactive Bars */}
            {chartSeries.map((day, idx) => {
              const slotW = plotW / chartSeries.length;
              const barW = Math.min(28, slotW * 0.58);
              const xCenter = padLeft + slotW * idx + slotW / 2;
              const barH = Math.max(4, (day.totalScore / maxChartValue) * plotH);
              const y = padTop + plotH - barH;
              const isSelected = day.date === selectedDayRecord.date;
              const showTickLabel =
                rangeDays === 7 || idx % 2 === 0 || idx === chartSeries.length - 1;

              const fill = day.goalReached
                ? isSelected
                  ? '#047857'
                  : '#10b981'
                : isSelected
                  ? '#1d4ed8'
                  : day.totalScore > 0
                    ? '#60a5fa'
                    : '#e2e8f0';

              return (
                <g
                  key={day.date}
                  onClick={() => setSelectedDateKey(day.date)}
                  className="cursor-pointer"
                >
                  {/* Invisible wider tap hitbox */}
                  <rect
                    x={padLeft + slotW * idx}
                    y={padTop}
                    width={slotW}
                    height={plotH + padBottom}
                    fill="transparent"
                  />

                  <rect
                    x={xCenter - barW / 2}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={4}
                    fill={fill}
                    stroke={isSelected ? '#0f172a' : 'none'}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />

                  {day.totalScore > 0 && (
                    <text
                      x={xCenter}
                      y={Math.max(12, y - 5)}
                      textAnchor="middle"
                      className="fill-slate-700 text-[10px] font-mono-num font-semibold"
                    >
                      {day.totalScore}
                    </text>
                  )}

                  {showTickLabel && (
                    <text
                      x={xCenter}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className={`text-[10px] font-mono-num ${
                        isSelected ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                      }`}
                    >
                      {formatShortMonthDay(day.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span>{formatFullDateLabel(selectedDayRecord.date)}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="font-mono-num text-blue-700">{selectedDayRecord.totalScore} 分</span>
            </div>

            <div className="text-xs font-semibold">
              {selectedDayRecord.goalReached ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>達成目標（{selectedDayRecord.goalTarget} 分）</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>未達標（目標 {selectedDayRecord.goalTarget} 分）</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-slate-500">情境填空</span>
              <span className="font-mono-num font-bold text-slate-900">
                {selectedDayRecord.breakdown.cloze} 分
              </span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-slate-500">句子重組</span>
              <span className="font-mono-num font-bold text-slate-900">
                {selectedDayRecord.breakdown.scramble} 分
              </span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-slate-500">情境二選一</span>
              <span className="font-mono-num font-bold text-slate-900">
                {selectedDayRecord.breakdown.dialogue} 分
              </span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-slate-500">錯題複習</span>
              <span className="font-mono-num font-bold text-slate-900">
                {selectedDayRecord.breakdown.mistakeReview} 分
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Daily Records List */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900">近期每日紀錄清單</h2>

        <div className="divide-y divide-slate-100">
          {historyList.slice(0, 14).map((rec) => (
            <button
              key={rec.date}
              type="button"
              onClick={() => setSelectedDateKey(rec.date)}
              className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left hover:bg-slate-50/80 rounded-lg px-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono-num text-sm font-semibold text-slate-900">
                  {rec.date}
                </span>
                {rec.goalReached ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>達標</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <span>未達標</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-mono-num">
                <span>填空 {rec.breakdown.cloze}</span>
                <span aria-hidden="true" className="text-slate-300">/</span>
                <span>重組 {rec.breakdown.scramble}</span>
                <span aria-hidden="true" className="text-slate-300">/</span>
                <span>二選一 {rec.breakdown.dialogue}</span>
                <span aria-hidden="true" className="text-slate-300">/</span>
                <span>複習 {rec.breakdown.mistakeReview}</span>
                <span className="ml-auto sm:ml-2 font-bold text-sm text-slate-900">
                  總計 {rec.totalScore} 分
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
