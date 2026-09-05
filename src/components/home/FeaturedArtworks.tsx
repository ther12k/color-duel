import { Heart, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Artwork } from '../../types/game';

interface FeaturedArtworksProps {
  artworks: Artwork[];
  completedIds: string[];
  onSelectArtwork: (artwork: Artwork) => void;
  onSeeAll: () => void;
}

export function FeaturedArtworks({
  artworks,
  completedIds,
  onSelectArtwork,
  onSeeAll,
}: FeaturedArtworksProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-slate-800 text-lg">
          Featured Artworks
        </h3>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-0.5 cursor-pointer"
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {artworks.slice(0, 4).map((art) => {
          const isCompleted = completedIds.includes(art.id);
          return (
            <div
              key={art.id}
              id={`featured-art-${art.id}`}
              onClick={() => onSelectArtwork(art)}
              className="group bg-white rounded-2xl p-2 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98] flex flex-col"
            >
              {/* Artwork Preview Card */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={art.thumbnail}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Completed badge if finished */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                  </div>
                )}

                {/* Difficulty badge */}
                <div className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {art.difficulty}
                </div>
              </div>

              {/* Title & Likes */}
              <div className="mt-2 px-1">
                <h4 className="font-display font-bold text-slate-800 text-sm truncate">
                  {art.title}
                </h4>
                <div className="flex items-center justify-between mt-1 text-slate-400 text-xs">
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1 text-rose-500 font-medium text-[11px]">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>{art.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
