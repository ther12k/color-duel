import { Clock, Play, Sparkles } from 'lucide-react';
import { Artwork } from '../../types/game';

interface TodayChallengeBannerProps {
  artwork: Artwork;
  onStartChallenge: () => void;
}

export function TodayChallengeBanner({
  artwork,
  onStartChallenge,
}: TodayChallengeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] p-4 text-white shadow-lg border border-white/20">
      {/* Background artwork glimpse */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 overflow-hidden pointer-events-none">
        <img
          src={artwork.thumbnail}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="bg-rose-500 text-white font-display font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            TODAY'S CHALLENGE
          </span>
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300">
            <span>🪙 +500</span>
            <span>💎 +50</span>
          </div>
        </div>

        <div>
          <h2 className="font-display font-black text-2xl text-white tracking-tight leading-tight">
            {artwork.title}
          </h2>
          <p className="text-xs text-indigo-100/90 font-sans mt-0.5 max-w-[260px]">
            Same picture. Different players. Color it. Compete. Win!
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[11px] text-amber-200 font-sans font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>14:26:31 left today</span>
          </div>

          <button
            id="today-challenge-start-btn"
            onClick={onStartChallenge}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-display font-bold text-xs shadow-md shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-amber-950" />
            <span>Start Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
