import { Bell, Coins, Gem, Plus } from 'lucide-react';
import { UserProfile } from '../../types/game';
import { rankTitle } from '../../lib/utils';

interface HeaderProps {
  user: UserProfile;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

/** Top chrome: player identity + XP on the left, currencies and bell on the right. */
export function Header({
  user,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
}: HeaderProps) {
  const xpPercent = Math.min(100, Math.round((user.xp / Math.max(1, user.xpForNextLevel)) * 100));

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F6F6F4]/95 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between">
      {/* Left: Avatar with level, rank title & XP bar */}
      <button
        id="header-user-profile-btn"
        onClick={onOpenProfile}
        className="flex items-center gap-2.5 text-left cursor-pointer transition-transform active:scale-95"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-display font-extrabold text-[14px] text-slate-900 leading-tight">
            Lv. {user.level}
          </span>
          <span className="text-[10px] text-slate-500 font-sans leading-tight truncate">
            {rankTitle(user.level)}
          </span>
          <div className="mt-1 h-1.5 w-20 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-sky-500 rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Right: Currencies & Notification */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Coins */}
        <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full pl-2 pr-1 py-1 shadow-xs">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-display font-bold text-slate-800 text-xs sm:text-sm tabular-nums">
            {user.coins.toLocaleString()}
          </span>
          <button
            onClick={onOpenSettings}
            aria-label="Get more coins"
            className="w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 transition-colors ml-0.5 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full pl-2 pr-1 py-1 shadow-xs">
          <Gem className="w-3.5 h-3.5 text-sky-500" />
          <span className="font-display font-bold text-slate-800 text-xs sm:text-sm tabular-nums">
            {user.gems}
          </span>
          <button
            onClick={onOpenSettings}
            aria-label="Get more gems"
            className="w-4 h-4 rounded-full bg-sky-400 text-white flex items-center justify-center hover:bg-sky-500 transition-colors ml-0.5 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* Bell Notification */}
        <button
          id="header-notification-btn"
          onClick={onOpenNotifications}
          className="relative p-1.5 text-slate-700 hover:text-slate-900 hover:bg-white rounded-full transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5 fill-slate-700" />
          {user.unreadNotifications > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#F6F6F4]" />
          )}
        </button>
      </div>
    </header>
  );
}
