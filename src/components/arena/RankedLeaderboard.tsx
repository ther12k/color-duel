import { Trophy, Medal } from 'lucide-react';
import { UserProfile } from '../../types/game';

interface RankedLeaderboardProps {
  user: UserProfile;
}

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Maya_Art', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80', score: 2890, badge: '🥇' },
  { rank: 2, name: 'ZenColorist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80', score: 2450, badge: '🥈' },
  { rank: 3, name: 'Alex', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80', score: 2120, badge: '🥉' },
  { rank: 4, name: 'KiraNeko', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80', score: 1890, badge: '' },
];

export function RankedLeaderboard({ user }: RankedLeaderboardProps) {
  return (
    <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-display font-black text-slate-800 text-sm">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Season 4 Ranked Standings</span>
        </div>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          Tier: Gold III
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {LEADERBOARD_USERS.map((u) => (
          <div key={u.rank} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-extrabold text-xs text-slate-400 w-4 text-center">
                {u.badge || u.rank}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-display font-bold text-xs text-slate-800">
                {u.name}
              </span>
            </div>
            <div className="font-display font-black text-xs text-indigo-600">
              {u.score.toLocaleString()} pts
            </div>
          </div>
        ))}

        {/* Current User rank */}
        <div className="flex items-center justify-between py-2.5 bg-indigo-50/70 -mx-3.5 px-3.5 rounded-xl mt-1 border border-indigo-100">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-extrabold text-xs text-indigo-700 w-4 text-center">
              #14
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400">
              <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xs text-indigo-950">
              {user.name} (You)
            </span>
          </div>
          <div className="font-display font-black text-xs text-indigo-700">
            {user.arenaPoints.toLocaleString()} pts
          </div>
        </div>
      </div>
    </div>
  );
}
