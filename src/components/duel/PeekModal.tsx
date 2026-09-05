import { Eye } from 'lucide-react';
import { Artwork } from '../../types/game';

interface PeekModalProps {
  artwork: Artwork;
  peeksLeft: number;
  isPeeking: boolean;
  peekTimer: number;
  onTriggerPeek: () => void;
}

export function PeekModal({
  artwork,
  peeksLeft,
  isPeeking,
  peekTimer,
  onTriggerPeek,
}: PeekModalProps) {
  return (
    <>
      {/* Mini Thumbnail with Peek Button (Pinned on top-left of artwork) */}
      <div className="absolute top-2 left-2 z-20 flex flex-col items-center bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md">
        <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200">
          <img
            src={artwork.thumbnail}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </div>

        <button
          id="peek-button"
          onClick={onTriggerPeek}
          disabled={peeksLeft <= 0 || isPeeking}
          className="mt-1.5 w-full flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-amber-950 font-display font-bold text-[10px] px-2 py-1 rounded-xl shadow-xs active:scale-95 cursor-pointer transition-all"
        >
          <Eye className="w-3 h-3" />
          <span>Peek ({peeksLeft})</span>
        </button>
        <span className="text-[8px] text-slate-500 font-sans mt-0.5 text-center leading-none">
          See art briefly!
        </span>
      </div>

      {/* Full Screen Peek Overlay when active */}
      {isPeeking && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-3 rounded-3xl shadow-2xl max-w-[340px] w-full border-4 border-amber-400 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-display font-black text-amber-600 text-sm">
                🧠 MEMORY REVEAL
              </span>
              <span className="bg-amber-100 text-amber-900 font-display font-extrabold text-xs px-2 py-0.5 rounded-full">
                {peekTimer}s remaining
              </span>
            </div>

            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={artwork.thumbnail}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-[11px] text-slate-600 font-sans text-center mt-2">
              Memorize where each color belongs! Region numbers will vanish when time runs out.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
