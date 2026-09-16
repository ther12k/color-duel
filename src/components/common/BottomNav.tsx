import { Home, Images, Plus, Swords, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TabType = 'home' | 'duel' | 'gallery' | 'profile';
export type NavTab = TabType;

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  /** Center "+" action — opens the Create flow. */
  onCreate: () => void;
}

const TABS_LEFT: Array<{ id: TabType; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'duel', label: 'Arena', icon: Swords },
];

const TABS_RIGHT: Array<{ id: TabType; label: string; icon: typeof Home }> = [
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange, onCreate }: BottomNavProps) {
  const renderTab = ({ id, label, icon: Icon }: (typeof TABS_LEFT)[number]) => (
    <button
      key={id}
      id={`nav-tab-${id}`}
      onClick={() => onTabChange(id)}
      className={cn(
        'flex flex-col items-center justify-center flex-1 py-1.5 transition-colors cursor-pointer',
        activeTab === id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
      )}
    >
      <Icon className={cn('w-[21px] h-[21px]', activeTab === id && 'fill-slate-900/10')} strokeWidth={activeTab === id ? 2.4 : 2} />
      <span className={cn('text-[10px] font-sans mt-0.5', activeTab === id ? 'font-bold' : 'font-medium')}>
        {label}
      </span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 max-w-md mx-auto px-2 shadow-lg">
      <div className="flex items-stretch justify-around">
        {TABS_LEFT.map(renderTab)}

        {/* Center Create action */}
        <div className="flex-1 flex justify-center items-end">
          <button
            id="nav-create-btn"
            onClick={onCreate}
            aria-label="Create challenge"
            className="-mt-5 w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white/90 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {TABS_RIGHT.map(renderTab)}
      </div>
    </nav>
  );
}
