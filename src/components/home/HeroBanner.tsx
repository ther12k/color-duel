import { ChevronRight, Zap } from 'lucide-react';

interface HeroBannerProps {
  onPlaySmartDuel: () => void;
}

export function HeroBanner({ onPlaySmartDuel }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#4338CA] to-[#6366F1] p-4.5 text-white shadow-xl shadow-indigo-900/20 border border-indigo-400/20">
      {/* Decorative stars and lighting glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

      {/* Top Tagline */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 bg-[#10B981] text-white font-display font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
          <Zap className="w-2.5 h-2.5 fill-white" /> NEW
        </span>
        <span className="text-[10px] font-semibold text-amber-200/90 tracking-wide font-sans">
          ✨ Same Art · Different Speed · You vs the World!
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        {/* Left column: Title & Call to Action */}
        <div className="flex-1 z-10">
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white drop-shadow-sm">
            Smart Duel
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 leading-relaxed font-sans max-w-[200px]">
            Real players. Same picture. Prioritize objectives to win!
          </p>

          <button
            id="hero-play-smart-duel-btn"
            onClick={onPlaySmartDuel}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-amber-950 font-display font-bold text-sm shadow-md shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <span>Play Now</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Right column: VS player showdown visual */}
        <div className="relative flex items-center justify-center pt-1">
          {/* Player avatar */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-400 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                alt="You"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute -top-1 -right-1 text-xs">👑</span>
            </div>
            <span className="mt-1 bg-indigo-950/80 text-amber-300 font-display font-bold text-[10px] px-1.5 py-0.2 rounded-full border border-indigo-400/40">
              00:42
            </span>
          </div>

          {/* VS Lightning emblem */}
          <div className="mx-1 flex flex-col items-center justify-center z-10">
            <span className="font-display font-black text-lg text-amber-400 italic tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
              VS
            </span>
          </div>

          {/* Opponent avatar */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-blue-400 to-teal-400 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80"
                alt="Alex"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="mt-1 bg-indigo-950/80 text-slate-300 font-display font-bold text-[10px] px-1.5 py-0.2 rounded-full border border-indigo-400/40">
              01:15
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
