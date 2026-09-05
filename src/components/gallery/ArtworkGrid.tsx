import { Heart, CheckCircle2 } from 'lucide-react';
import { Artwork } from '../../types/game';

interface ArtworkGridProps {
  artworks: Artwork[];
  completedIds: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

const CATEGORIES = ['All', 'Fantasy', 'Nature', 'Cozy'];

export function ArtworkGrid({
  artworks,
  completedIds,
  selectedCategory,
  onSelectCategory,
  onSelectArtwork,
}: ArtworkGridProps) {
  const filtered =
    selectedCategory === 'All'
      ? artworks
      : artworks.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-3">
      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-display font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Artworks */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((art) => {
          const isDone = completedIds.includes(art.id);
          return (
            <div
              key={art.id}
              onClick={() => onSelectArtwork(art)}
              className="bg-white rounded-2xl p-2 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98] flex flex-col group"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={art.thumbnail}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {isDone && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {art.difficulty}
                </div>
              </div>

              <div className="mt-2 px-1">
                <h4 className="font-display font-bold text-slate-800 text-xs truncate">
                  {art.title}
                </h4>
                <div className="flex items-center justify-between mt-1 text-slate-400 text-xs">
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
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
