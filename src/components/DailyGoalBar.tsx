import { CheckCircle2, Flame, Target } from 'lucide-react';
import { getComboMultiplier } from '../utils/storage';

export interface ScoreFeedbackToast {
  id: number;
  type: 'correct' | 'wrong';
  earnedPoints: number;
  basePoints: number;
  multiplier: number;
  combo: number;
  goalJustReached: boolean;
}

interface DailyGoalBarProps {
  todayScore: number;
  dailyGoal: number;
  currentCombo: number;
  lastFeedback: ScoreFeedbackToast | null;
  onOpenGoalSettings: () => void;
}

export function DailyGoalBar({
  todayScore,
  dailyGoal,
  currentCombo,
  lastFeedback,
  onOpenGoalSettings,
}: DailyGoalBarProps) {
  const progressPct = Math.min(100, Math.round((todayScore / Math.max(1, dailyGoal)) * 100));
  const goalReached = todayScore >= dailyGoal;
  const currentMultiplier = getComboMultiplier(Math.max(1, currentCombo));

  return (
    <section
      aria-label="今日積分與連擊狀態"
      className="bg-white border border-slate-200 rounded-2xl p-2.5 lg:p-4 space-y-1.5 lg:space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm lg:text-base font-bold text-slate-900">
          {goalReached ? (
            <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 shrink-0" />
          ) : (
            <Target className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 shrink-0" />
          )}
          <span>{goalReached ? '今日已達標' : '今日進度'}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono-num text-sm lg:text-base font-bold text-slate-900">
            {todayScore} <span className="text-slate-600 font-normal">/ {dailyGoal} 分</span>
          </span>
          <button
            type="button"
            onClick={onOpenGoalSettings}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
          >
            調整
          </button>
        </div>
      </div>

      <div className="w-full h-1.5 lg:h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            goalReached ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-1.5">
          <Flame
            className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${currentCombo >= 3 ? 'text-amber-600' : 'text-slate-500'}`}
          />
          <span>
            連擊 <strong className="font-mono-num text-slate-900">{currentCombo}</strong> 題
          </span>
          <span aria-hidden="true">·</span>
          <span>
            倍率{' '}
            <strong className="font-mono-num text-blue-700">
              {currentCombo > 0 ? `${currentMultiplier.toFixed(1)}x` : '1.0x'}
            </strong>
          </span>
        </div>

        {lastFeedback && (
          <div
            key={lastFeedback.id}
            className={`font-semibold font-mono-num ${
              lastFeedback.type === 'correct' ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {lastFeedback.type === 'correct'
              ? `+${lastFeedback.earnedPoints} 分（${lastFeedback.multiplier.toFixed(1)}x）`
              : '連擊歸零 · 已入錯題本'}
          </div>
        )}
      </div>
    </section>
  );
}
