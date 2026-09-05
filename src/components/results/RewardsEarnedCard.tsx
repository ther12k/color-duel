import { UserProfile } from '../../types/game';

interface RewardsEarnedCardProps {
  coins: number;
  arenaPoints: number;
  xp: number;
  user: UserProfile;
}

export function RewardsEarnedCard({
  coins,
  arenaPoints,
  xp,
  user,
}: RewardsEarnedCardProps) {
  const currentXP = user.xp + xp;
  const progressPercent = Math.min(100, (currentXP / user.xpForNextLevel) * 100);

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-3">
      <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
        Rewards Earned
      </h4>

      <div className="grid grid-cols-3 gap-2">
        {/* Coins */}
        <div className="flex items-center gap-2 p-2 bg-amber-50/70 rounded-xl border border-amber-200/50">
          <span className="text-xl">🪙</span>
          <div>
            <div className="font-display font-black text-amber-900 text-sm">
              +{coins}
            </div>
            <div className="text-[10px] text-amber-700/80 font-medium">Coins</div>
          </div>
        </div>

        {/* Arena Points */}
        <div className="flex items-center gap-2 p-2 bg-blue-50/70 rounded-xl border border-blue-200/50">
          <span className="text-xl">🏆</span>
          <div>
            <div className="font-display font-black text-blue-900 text-sm">
              +{arenaPoints}
            </div>
            <div className="text-[10px] text-blue-700/80 font-medium">Arena</div>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 p-2 bg-purple-50/70 rounded-xl border border-purple-200/50">
          <span className="text-xl">💎</span>
          <div>
            <div className="font-display font-black text-purple-900 text-sm">
              +{xp}
            </div>
            <div className="text-[10px] text-purple-700/80 font-medium">XP</div>
          </div>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-xs font-sans mb-1">
          <span className="font-display font-bold text-slate-700">
            Level {user.level}
          </span>
          <span className="text-slate-400 font-medium text-[11px]">
            {currentXP} / {user.xpForNextLevel} XP
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
