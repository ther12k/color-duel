import { useMemo } from 'react';
import { Flame, Palette, Target, Percent, Swords } from 'lucide-react';
import { Artwork, UserProfile } from '../../types/game';
import { ArtworkCard } from '../common/ArtworkCard';
import { SectionHeader } from '../common/SectionHeader';
import { rankTitle } from '../../lib/utils';
import { progressMapFor } from '../../lib/progressStore';

interface ProfileScreenProps {
  user: UserProfile;
  artworks: Artwork[];
  onSelectArtwork: (art: Artwork) => void;
}

/** Profile tab: identity card, match stats, then the player's works shelf. */
export function ProfileScreen({ user, artworks, onSelectArtwork }: ProfileScreenProps) {
  const progressByArtwork = useMemo(() => progressMapFor(artworks), [artworks, user.matchesPlayed]);

  const completed = artworks.filter((a) => user.completedArtworkIds.includes(a.id));
  const inProgress = artworks.filter((a) => {
    if (user.completedArtworkIds.includes(a.id)) return false;
    const p = progressByArtwork[a.id];
    return p && p.completedRegionIds.length > 0;
  });
  const notStarted = artworks.filter(
    (a) => !user.completedArtworkIds.includes(a.id) && !inProgress.includes(a)
  );

  const xpPercent = Math.min(100, Math.round((user.xp / Math.max(1, user.xpForNextLevel)) * 100));
  const winRate = user.matchesPlayed ? Math.round((user.matchesWon / user.matchesPlayed) * 100) : 0;

  const stats = [
    { icon: Swords, label: 'Matches', value: user.matchesPlayed, tone: 'text-amber-600 bg-amber-50' },
    { icon: Target, label: 'Win Rate', value: `${winRate}%`, tone: 'text-indigo-600 bg-indigo-50' },
    { icon: Flame, label: 'Streak', value: user.streakDays, tone: 'text-rose-600 bg-rose-50' },
    { icon: Percent, label: 'Arena Pts', value: user.arenaPoints, tone: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-[#F6F6F4] pb-28 px-3.5 pt-3 space-y-4">
      {/* Profile hero */}
      <div className="rounded-3xl bg-white border border-slate-200/70 shadow-xs p-4 flex items-center gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-50 shadow-sm shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-lg text-slate-900 leading-tight truncate">
              {user.name}
            </h1>
            <span className="shrink-0 bg-amber-100 text-amber-800 font-display font-bold text-[10px] px-2 py-0.5 rounded-full">
              Lv. {user.level}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-500 font-sans">
            {rankTitle(user.level)} · {completed.length} artworks finished
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-sky-500 rounded-full transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[9.5px] text-slate-400 font-sans tabular-nums shrink-0">
              {user.xp}/{user.xpForNextLevel} XP
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-2.5 flex flex-col items-center gap-1"
          >
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center ${s.tone}`}>
              <s.icon className="w-3.5 h-3.5" />
            </span>
            <span className="font-display font-black text-[15px] text-slate-800 leading-none tabular-nums">
              {s.value}
            </span>
            <span className="text-[9px] text-slate-400 font-sans font-medium uppercase tracking-wide">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* In progress */}
      <section>
        <SectionHeader title="In Progress" />
        {inProgress.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {inProgress.map((art) => {
              const p = progressByArtwork[art.id];
              return (
                <ArtworkCard
                  key={art.id}
                  artwork={art}
                  progressPercent={
                    p.totalRegions > 0 ? (p.completedRegionIds.length / p.totalRegions) * 100 : 0
                  }
                  onClick={() => onSelectArtwork(art)}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-5 text-center">
            <Palette className="w-5 h-5 text-slate-300 mx-auto" />
            <p className="text-[12px] text-slate-400 font-sans mt-1">
              Nothing on the easel. Pick an artwork and start coloring!
            </p>
          </div>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <SectionHeader title="Completed" />
          <div className="grid grid-cols-2 gap-3">
            {completed.map((art) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                isCompleted
                finished // earned reveal on the completed shelf
                onClick={() => onSelectArtwork(art)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Not started */}
      <section>
        <SectionHeader title="Not Started" />
        <div className="grid grid-cols-2 gap-3">
          {notStarted.map((art) => (
            <ArtworkCard key={art.id} artwork={art} onClick={() => onSelectArtwork(art)} />
          ))}
        </div>
      </section>
    </div>
  );
}
