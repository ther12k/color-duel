import { ChevronRight, Flame, Gift } from 'lucide-react';
import { UserProfile } from '../../types/game';

interface StreakGoalsProps {
  user: UserProfile;
  onOpenStreakModal?: () => void;
}

export function StreakGoals({ user, onOpenStreakModal }: StreakGoalsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {/* 7 Day Streak */}
      <div
        onClick={onOpenStreakModal}
        className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-98"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-xl shrink-0">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-slate-800 text-sm leading-tight">
                {user.streakDays}
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-sans">
                Day Streak
              </span>
            </div>
            <span className="text-[10px] text-orange-600 font-semibold block">
              Keep it up!
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Weekly Goals */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex-1 mr-2">
          <div className="flex items-center justify-between text-[11px] font-display font-bold text-slate-700">
            <span>Weekly Goals</span>
            <span className="text-purple-600">
              {user.weeklyGoalCompleted}/{user.weeklyGoalTotal}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 font-sans block truncate">
            Complete 5 artworks
          </span>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              style={{
                width: `${(user.weeklyGoalCompleted / user.weeklyGoalTotal) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-base shrink-0 shadow-2xs">
          🎁
        </div>
      </div>
    </div>
  );
}
