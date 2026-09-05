import { useState } from 'react';
import { Heart, CheckCircle2, Sparkles, ZoomIn } from 'lucide-react';
import { Artwork, ArtworkDifficulty } from '../../types/game';
import { ArtworkThumbnail } from '../common/ArtworkThumbnail';

interface ArtworkGridProps {
  artworks: Artwork[];
  completedIds: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

const CATEGORIES = ['All', 'Masterpiece', 'Cozy', 'Fantasy', 'Nature'];
const DIFFICULTIES: ('All' | ArtworkDifficulty)[] = ['All', 'Easy', 'Medium', 'Hard'];

export function ArtworkGrid({
  artworks,
  completedIds,
  selectedCategory,
  onSelectCategory,
  onSelectArtwork,
}: ArtworkGridProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | ArtworkDifficulty>('All');

  const filtered = artworks.filter((a) => {
    const matchesCategory =
      selectedCategory === 'All' || a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDifficulty =
      selectedDifficulty === 'All' || a.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-3">
      {/* Category Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
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

        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Level:
          </span>
          {DIFFICULTIES.map((diff) => {
            const isSelected = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-xl font-display font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  isSelected
                    ? diff === 'Hard'
                      ? 'bg-purple-800 text-amber-300 ring-2 ring-purple-400/50'
                      : diff === 'Medium'
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
                      : diff === 'Easy'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                      : 'bg-slate-800 text-white'
                    : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {diff === 'Hard' && '🟣'}
                {diff === 'Medium' && '🟡'}
                {diff === 'Easy' && '🟢'}
                <span>{diff}</span>
                {diff === 'Hard' && (
                  <span className="text-[9px] bg-amber-400/30 text-amber-200 px-1 rounded-xs">
                    Original
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Artworks */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((art) => {
          const isDone = completedIds.includes(art.id);
          const isHard = art.difficulty === 'Hard';

          return (
            <div
              key={art.id}
              onClick={() => onSelectArtwork(art)}
              className={`bg-white rounded-2xl p-2 border transition-all cursor-pointer active:scale-[0.98] flex flex-col group ${
                isHard
                  ? 'border-purple-200/90 shadow-sm hover:border-purple-400 hover:shadow-md'
                  : 'border-slate-100 shadow-2xs hover:shadow-md'
              }`}
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                <ArtworkThumbnail
                  artwork={art}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {isDone && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                  </div>
                )}

                {/* Difficulty & Style Pill */}
                <div
                  className={`absolute bottom-2 left-2 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                    isHard
                      ? 'bg-purple-900/90 text-amber-300 border border-purple-400/40'
                      : art.difficulty === 'Medium'
                      ? 'bg-amber-900/80 text-amber-200'
                      : 'bg-slate-900/75 text-emerald-300'
                  }`}
                >
                  {isHard && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                  <span>{art.difficulty}</span>
                </div>

                {isHard && (
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <ZoomIn className="w-2.5 h-2.5 text-amber-400" />
                    <span>Zoom</span>
                  </div>
                )}
              </div>

              <div className="mt-2 px-1">
                <h4 className="font-display font-bold text-slate-800 text-xs truncate">
                  {art.title}
                </h4>
                {art.artist && (
                  <p className="text-[10px] text-slate-400 truncate italic">
                    {art.artist}
                  </p>
                )}
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
