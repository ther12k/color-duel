import { Bell, Plus } from 'lucide-react';
import { UserProfile } from '../../types/game';

interface HeaderProps {
  user: UserProfile;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export function Header({
  user,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Avatar with Level badge */}
      <button
        id="header-user-profile-btn"
        onClick={onOpenProfile}
        className="flex items-center gap-2 group text-left cursor-pointer transition-transform active:scale-95"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 shadow-sm">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {/* Level pill */}
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-display font-bold text-[11px] px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs">
            {user.level}
          </span>
        </div>

        {/* Brand Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-display font-extrabold text-slate-800 text-lg tracking-tight leading-tight">
              Color <span className="text-[#8B5CF6] relative">
                Duel
                <span className="absolute -top-2.5 right-0 text-[10px]">👑</span>
              </span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium -mt-0.5">
            Color More. Play Together.
          </span>
        </div>
      </button>

      {/* Right: Currencies & Notification */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Coins */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 rounded-full pl-1.5 pr-1 py-0.5 shadow-xs">
          <span className="text-sm">🪙</span>
          <span className="font-display font-bold text-amber-900 text-xs sm:text-sm">
            {user.coins.toLocaleString()}
          </span>
          <button
            onClick={onOpenSettings}
            className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-bold hover:bg-amber-500 transition-colors ml-0.5 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1 bg-purple-50 border border-purple-200/80 rounded-full pl-1.5 pr-1 py-0.5 shadow-xs">
          <span className="text-sm">💎</span>
          <span className="font-display font-bold text-purple-900 text-xs sm:text-sm">
            {user.gems}
          </span>
          <button
            onClick={onOpenSettings}
            className="w-4 h-4 rounded-full bg-purple-400 text-white flex items-center justify-center text-[10px] font-bold hover:bg-purple-500 transition-colors ml-0.5 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* Bell Notification */}
        <button
          id="header-notification-btn"
          onClick={onOpenNotifications}
          className="relative p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5 fill-slate-700 text-slate-700" />
          {user.unreadNotifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
              {user.unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
