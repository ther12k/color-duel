import { DuelOpponent, UserProfile } from '../../types/game';

interface AreaProgressBarProps {
  user: UserProfile;
  rival: DuelOpponent;
  playerPercent: number;
  rivalPercent: number;
}

export function AreaProgressBar({
  user,
  rival,
  playerPercent,
  rivalPercent,
}: AreaProgressBarProps) {
  return (
    <div className="w-full px-4 py-1.5 flex items-center justify-between gap-2.5">
      {/* You progress */}
      <div className="flex items-center gap-1.5 flex-1">
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-400 shrink-0">
          <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, playerPercent)}%` }}
            />
          </div>
        </div>
        <span className="font-display font-bold text-xs text-indigo-700 min-w-[28px]">
          {playerPercent}%
        </span>
      </div>

      {/* Center Label */}
      <div className="shrink-0 bg-slate-100 text-slate-600 font-display font-semibold text-[10px] px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
        Area Progress
      </div>

      {/* Rival progress */}
      <div className="flex items-center gap-1.5 flex-1 flex-row-reverse">
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-blue-400 shrink-0">
          <img src={rival.avatar} alt={rival.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex justify-end">
            <div
              className="h-full bg-gradient-to-l from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, rivalPercent)}%` }}
            />
          </div>
        </div>
        <span className="font-display font-bold text-xs text-blue-700 min-w-[28px] text-right">
          {rivalPercent}%
        </span>
      </div>
    </div>
  );
}
