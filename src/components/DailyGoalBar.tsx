import { CheckCircle2, Target } from 'lucide-react';

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
  lastFeedback,
  onOpenGoalSettings,
}: DailyGoalBarProps) {
  const progressPct = Math.min(100, Math.round((todayScore / Math.max(1, dailyGoal)) * 100));
  const goalReached = todayScore >= dailyGoal;

  return (
    <section
      aria-label="今日積分進度"
      className="bg-white border border-slate-200 rounded-2xl px-3 py-2 lg:p-4 space-y-1.5 lg:space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm lg:text-base font-bold text-slate-900 min-w-0">
          {goalReached ? (
            <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 shrink-0" />
          ) : (
            <Target className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 shrink-0" />
          )}
          <span className="whitespace-nowrap">{goalReached ? '今日已達標' : '今日進度'}</span>
          {lastFeedback && (
            <span
              key={lastFeedback.id}
              className={`ml-1 text-xs sm:text-sm font-semibold font-mono-num whitespace-nowrap ${
                lastFeedback.type === 'correct' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {lastFeedback.type === 'correct'
                ? `+${lastFeedback.earnedPoints} 分`
                : '已入錯題本'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
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

      <div className="w-full h-1.5 lg:h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            goalReached ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </section>
  );
}
