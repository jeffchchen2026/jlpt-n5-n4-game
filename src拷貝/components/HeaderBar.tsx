import { AppTab } from '../data/types';

interface HeaderBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  mistakeCount: number;
  todayScore: number;
  dailyGoal: number;
}

export function HeaderBar({
  activeTab,
  onSelectTab,
  mistakeCount,
  todayScore,
  dailyGoal,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('play')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          日語情境記憶
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('play')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'play'
                ? 'text-blue-700 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            練習遊戲
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('mistakes')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'mistakes'
                ? 'text-blue-700 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            錯題本 {mistakeCount > 0 ? `(${mistakeCount})` : ''}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-blue-700 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            分數統計
          </button>
        </nav>

        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 font-mono-num cursor-pointer"
        >
          今日 {todayScore}/{dailyGoal}
        </button>
      </div>
    </header>
  );
}
