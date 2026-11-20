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
      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {goalReached ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Target className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{goalReached ? '今日目標已達成' : '今日目標進度'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono-num text-sm font-bold text-slate-900">
            {todayScore} <span className="text-slate-400 font-normal">/ {dailyGoal} 分</span>
          </span>
          <button
            type="button"
            onClick={onOpenGoalSettings}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
          >
            調整目標
          </button>
        </div>
      </div>

      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            goalReached ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Flame
            className={`w-3.5 h-3.5 ${currentCombo >= 3 ? 'text-amber-600' : 'text-slate-400'}`}
          />
          <span>
            目前連擊 <strong className="font-mono-num text-slate-900">{currentCombo}</strong> 題
          </span>
          <span aria-hidden="true">·</span>
          <span>
            加成倍率{' '}
            <strong className="font-mono-num text-blue-700">
              {currentCombo > 0 ? `${currentMultiplier.toFixed(1)}x` : '1.0x'}
            </strong>
          </span>
        </div>

        {lastFeedback && (
          <div
            key={lastFeedback.id}
            className={`font-medium font-mono-num ${
              lastFeedback.type === 'correct' ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {lastFeedback.type === 'correct'
              ? `+${lastFeedback.earnedPoints} 分（${lastFeedback.basePoints} × ${lastFeedback.multiplier.toFixed(1)}x）`
              : '連擊歸零 · 已收錄錯題本'}
          </div>
        )}
      </div>
    </section>
  );
}
