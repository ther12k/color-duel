import { Trophy, Flame, Award, Palette, CheckCircle2 } from 'lucide-react';
import { Artwork, UserProfile } from '../../types/game';

interface ProfileScreenProps {
  user: UserProfile;
  artworks: Artwork[];
  onSelectArtwork: (art: Artwork) => void;
}

export function ProfileScreen({ user, artworks, onSelectArtwork }: ProfileScreenProps) {
  const completedList = artworks.filter((a) => user.completedArtworkIds.includes(a.id));

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-24 px-3.5 pt-3 space-y-3.5">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#4F46E5] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-400 shadow-md">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-display font-extrabold text-[10px] px-1.5 py-0.2 rounded-full shadow-xs">
              Lv. {user.level}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="font-display font-black text-xl text-white">
              {user.name}
            </h2>
            <p className="text-xs text-indigo-100 font-sans">
              Master Colorist · Gold III
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                🪙 {user.coins}
              </span>
              <span className="flex items-center gap-1 font-bold text-cyan-300">
                💎 {user.gems}
              </span>
              <span className="flex items-center gap-1 font-bold text-indigo-200">
                🏆 {user.arenaPoints}
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Progress */}
        <div className="mt-4 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-sans mb-1 text-indigo-100">
            <span>Level {user.level} Progress</span>
            <span>
              {user.xp} / {user.xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${(user.xp / user.xpForNextLevel) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duel Combat Record Stats */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2.5">
        <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
          Combat Record
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-xl">
            <div className="font-display font-black text-slate-800 text-base">
              {user.matchesPlayed}
            </div>
            <div className="text-[9.5px] text-slate-400 font-sans mt-0.5">Played</div>
          </div>

          <div className="p-2 bg-emerald-50 rounded-xl">
            <div className="font-display font-black text-emerald-700 text-base">
              {user.matchesWon}
            </div>
            <div className="text-[9.5px] text-emerald-600 font-sans mt-0.5">Won</div>
          </div>

          <div className="p-2 bg-indigo-50 rounded-xl">
            <div className="font-display font-black text-indigo-700 text-base">
              {Math.round((user.matchesWon / Math.max(1, user.matchesPlayed)) * 100)}%
            </div>
            <div className="text-[9.5px] text-indigo-600 font-sans mt-0.5">Win Rate</div>
          </div>

          <div className="p-2 bg-orange-50 rounded-xl">
            <div className="font-display font-black text-orange-600 text-base flex items-center justify-center gap-0.5">
              <span>{user.streakDays}</span>
              <span>🔥</span>
            </div>
            <div className="text-[9.5px] text-orange-600 font-sans mt-0.5">Streak</div>
          </div>
        </div>
      </div>

      {/* Badges / Mastery Showcase */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2.5">
        <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
          Achievements & Badges
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl">
            <span className="text-xl">🎯</span>
            <div>
              <div className="font-display font-bold text-xs text-amber-950">
                Deadline Master
              </div>
              <div className="text-[9.5px] text-amber-800/80 font-sans">
                Completed 50 bonus targets
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-purple-50/70 border border-purple-200/60 rounded-xl">
            <span className="text-xl">🧠</span>
            <div>
              <div className="font-display font-bold text-xs text-purple-950">
                Memory Ace
              </div>
              <div className="text-[9.5px] text-purple-800/80 font-sans">
                Won 10 Memory Duels
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-blue-50/70 border border-blue-200/60 rounded-xl">
            <span className="text-xl">⚡</span>
            <div>
              <div className="font-display font-bold text-xs text-blue-950">
                Fast Finisher
              </div>
              <div className="text-[9.5px] text-blue-800/80 font-sans">
                Sub-60s full clear
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
            <span className="text-xl">🎨</span>
            <div>
              <div className="font-display font-bold text-xs text-emerald-950">
                True Artisan
              </div>
              <div className="text-[9.5px] text-emerald-800/80 font-sans">
                Perfect accuracy run
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Artworks */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            Completed Masterpieces ({completedList.length})
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {completedList.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArtwork(art)}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shadow-2xs"
            >
              <img
                src={art.thumbnail}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
