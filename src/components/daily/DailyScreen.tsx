import { useEffect, useMemo, useState } from 'react';
import { Flame, Play, Clock, CalendarDays, ChevronLeft } from 'lucide-react';
import { Artwork } from '../../types/game';
import { SectionHeader } from '../common/SectionHeader';
import { getPlayedDates } from '../../lib/progressStore';
import { cn } from '../../lib/utils';

interface DailyScreenProps {
  artworks: Artwork[];
  streakDays: number;
  onStartDaily: () => void;
  onExit?: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Today's challenge hero + a month grid of played days. */
export function DailyScreen({ artworks, streakDays, onStartDaily, onExit }: DailyScreenProps) {
  const dailyArt = artworks.find((a) => a.isDaily) ?? artworks[0];
  const playedDates = useMemo(() => getPlayedDates(), [artworks.length]);
  const [now, setNow] = useState(Date.now());

  // Ticking countdown to local midnight.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const secondsLeft = Math.max(0, Math.floor((midnight.getTime() - now) / 1000));
  const countdown = [secondsLeft / 3600, (secondsLeft % 3600) / 60, secondsLeft % 60]
    .map((n) => Math.floor(n).toString().padStart(2, '0'))
    .join(':');

  // Month grid for the current month, weeks starting Sunday.
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const iso = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-md mx-auto bg-[#F6F6F4] pb-24 px-3.5 pt-3 space-y-4">
      {/* Back row (full-screen mode — there is no tab bar here) */}
      {onExit && (
        <button
          id="daily-back-btn"
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-display font-bold text-[13px] cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Home
        </button>
      )}

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-5 text-white shadow-lg border border-white/20">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-20 pointer-events-none overflow-hidden">
          {dailyArt.imageReference ? (
            <img src={dailyArt.imageReference.previewNumbered} alt="" className="w-full h-full object-cover" />
          ) : (
            /* Lineart silhouette only — no palette colors before the reveal. */
            <svg viewBox={dailyArt.viewBox} className="w-full h-full">
              {dailyArt.regions.map((r) => (
                <path key={r.id} d={r.path} fill="#FFFFFF" stroke="#18181B" strokeWidth={1.5} fillRule={r.fillRule} />
              ))}
            </svg>
          )}
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-rose-500 text-white font-display font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Daily Challenge
            </span>
            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums">{countdown}</span>
            </div>
          </div>

          <div>
            <h2 className="font-display font-black text-[26px] leading-tight tracking-tight">
              {dailyArt.title}
            </h2>
            <p className="text-[11.5px] text-indigo-100/90 font-sans mt-0.5">
              {dailyArt.subtitle ?? 'A fresh picture every day. Streak bonuses await.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onStartDaily}
              className="flex-1 py-2.5 rounded-2xl bg-white text-indigo-700 font-display font-black text-[13px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-indigo-700" />
              Start Today's Art
            </button>
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/20 backdrop-blur-xs flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-300" />
              <span className="font-display font-bold text-sm tabular-nums">{streakDays}</span>
              <span className="text-[10px] text-indigo-100 font-sans">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month grid */}
      <section>
        <SectionHeader
          title={today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs p-4">
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-bold text-slate-400 font-sans py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`pad-${i}`} />;
              const isToday = day === today.getDate();
              const isPlayed = playedDates.has(iso(day));
              return (
                <div
                  key={day}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-[11.5px] font-bold font-sans transition-colors',
                    isPlayed
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-slate-500 bg-slate-50',
                    isToday && !isPlayed && 'ring-2 ring-indigo-300 text-indigo-700',
                    isToday && isPlayed && 'ring-2 ring-indigo-300 ring-offset-1'
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <p className="text-[10.5px] text-slate-400 font-sans mt-3 flex items-center gap-1.5 justify-center">
            <CalendarDays className="w-3.5 h-3.5" />
            Colored days light up. Play today to keep your {streakDays}-day streak alive.
          </p>
        </div>
      </section>
    </div>
  );
}
