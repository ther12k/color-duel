import { Home, Swords, Plus, Images, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TabType = 'home' | 'arena' | 'create' | 'gallery' | 'profile';
export type NavTab = TabType;

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 max-w-md mx-auto px-3 py-1.5 flex items-center justify-around shadow-lg">
      {/* Home */}
      <button
        id="nav-tab-home"
        onClick={() => onTabChange('home')}
        className={cn(
          'flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer',
          activeTab === 'home' ? 'text-[#6366F1]' : 'text-slate-400 hover:text-slate-600'
        )}
      >
        <Home className={cn('w-5 h-5 transition-transform', activeTab === 'home' && 'scale-110')} />
        <span className="text-[11px] font-medium font-sans mt-0.5">Home</span>
        {activeTab === 'home' && (
          <span className="w-4 h-0.5 bg-[#6366F1] rounded-full mt-0.5" />
        )}
      </button>

      {/* Arena */}
      <button
        id="nav-tab-arena"
        onClick={() => onTabChange('arena')}
        className={cn(
          'flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer',
          activeTab === 'arena' ? 'text-[#6366F1]' : 'text-slate-400 hover:text-slate-600'
        )}
      >
        <Swords className={cn('w-5 h-5 transition-transform', activeTab === 'arena' && 'scale-110')} />
        <span className="text-[11px] font-medium font-sans mt-0.5">Arena</span>
        {activeTab === 'arena' && (
          <span className="w-4 h-0.5 bg-[#6366F1] rounded-full mt-0.5" />
        )}
      </button>

      {/* Create (Center Floating FAB) */}
      <div className="flex-1 flex justify-center -mt-5">
        <button
          id="nav-tab-create"
          onClick={() => onTabChange('create')}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] text-white flex flex-col items-center justify-center shadow-lg shadow-purple-500/35 active:scale-95 transition-transform border-4 border-white cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[9px] font-bold tracking-tight -mt-0.5">Create</span>
        </button>
      </div>

      {/* Gallery */}
      <button
        id="nav-tab-gallery"
        onClick={() => onTabChange('gallery')}
        className={cn(
          'flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer',
          activeTab === 'gallery' ? 'text-[#6366F1]' : 'text-slate-400 hover:text-slate-600'
        )}
      >
        <Images className={cn('w-5 h-5 transition-transform', activeTab === 'gallery' && 'scale-110')} />
        <span className="text-[11px] font-medium font-sans mt-0.5">Gallery</span>
        {activeTab === 'gallery' && (
          <span className="w-4 h-0.5 bg-[#6366F1] rounded-full mt-0.5" />
        )}
      </button>

      {/* Profile */}
      <button
        id="nav-tab-profile"
        onClick={() => onTabChange('profile')}
        className={cn(
          'flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer',
          activeTab === 'profile' ? 'text-[#6366F1]' : 'text-slate-400 hover:text-slate-600'
        )}
      >
        <User className={cn('w-5 h-5 transition-transform', activeTab === 'profile' && 'scale-110')} />
        <span className="text-[11px] font-medium font-sans mt-0.5">Profile</span>
        {activeTab === 'profile' && (
          <span className="w-4 h-0.5 bg-[#6366F1] rounded-full mt-0.5" />
        )}
      </button>
    </nav>
  );
}
