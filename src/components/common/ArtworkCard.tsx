import { CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Artwork } from '../../types/game';
import { cn } from '../../lib/utils';
import { ArtworkThumbnail } from './ArtworkThumbnail';

interface ArtworkCardProps {
  // React 19 types require key to be declared for explicit list usage.
  key?: string | number;
  artwork: Artwork;
  isCompleted?: boolean;
  progressPercent?: number;
  /** Reveal finished paint (completed shelf only — selection stays lineart). */
  finished?: boolean;
  onClick: () => void;
  className?: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Hard: 'bg-purple-100 text-purple-800',
};

/** Rounded artwork tile used across Gallery / Discover / My Works grids. */
export function ArtworkCard({ artwork, isCompleted, progressPercent, finished, onClick, className }: ArtworkCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md hover:border-slate-300',
        'transition-all active:scale-[0.98] overflow-hidden cursor-pointer flex flex-col',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.04]">
          <ArtworkThumbnail artwork={artwork} finished={finished} className="w-full h-full" />
        </div>

        {isCompleted && (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-white/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        )}

        {artwork.imageReference && (
          <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
            <ImageIcon className="w-2.5 h-2.5" />
            Preview
          </span>
        )}

        {typeof progressPercent === 'number' && progressPercent > 0 && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/15">
            <div
              className="h-full bg-indigo-500 rounded-r-full"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-2.5 flex flex-col gap-1">
        <span className="font-display font-bold text-[13px] text-slate-800 leading-tight line-clamp-2">
          {artwork.title}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'text-[9.5px] font-bold px-1.5 py-0.5 rounded-md',
              DIFFICULTY_STYLES[artwork.difficulty] ?? 'bg-slate-100 text-slate-700'
            )}
          >
            {artwork.variants && artwork.variants.length > 1 ? 'Levels' : artwork.difficulty}
          </span>
          <span className="text-[10px] text-slate-400 font-sans">{artwork.category}</span>
        </div>
      </div>
    </button>
  );
}
