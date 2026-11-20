import { BarChart3, BookMarked, Gamepad2 } from 'lucide-react';
import { AppTab } from '../data/types';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  mistakeCount: number;
}

export function BottomNav({ activeTab, onSelectTab, mistakeCount }: BottomNavProps) {
  const items: { id: AppTab; label: string; icon: typeof Gamepad2; badge?: number }[] = [
    { id: 'play', label: '練習遊戲', icon: Gamepad2 },
    { id: 'mistakes', label: '錯題本', icon: BookMarked, badge: mistakeCount },
    { id: 'dashboard', label: '分數統計', icon: BarChart3 },
  ];

  return (
    <nav
      aria-label="主導覽"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
    >
      <div className="grid grid-cols-3 h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                active ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 text-[11px] font-mono-num text-rose-600 font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-none whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
