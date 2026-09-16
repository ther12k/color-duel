import { ZoomIn, ZoomOut } from 'lucide-react';

interface ArtworkProgressCardProps {
  filledCount: number;
  totalCount: number;
  zoomLevel: number;
  maxZoom: number;
  /** Zoom step applied to the canvas (parent owns zoom state). */
  onZoomDelta: (delta: number) => void;
}

const RING_R = 15.5;
const RING_C = 2 * Math.PI * RING_R;

/** Bottom card: completion ring, colored-areas count and canvas zoom controls. */
export function ArtworkProgressCard({
  filledCount,
  totalCount,
  zoomLevel,
  maxZoom,
  onZoomDelta,
}: ArtworkProgressCardProps) {
  const percent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="px-2.5 pb-2 pt-1">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs px-3.5 py-2.5 flex items-center gap-3">
        {/* Completion ring */}
        <div className="relative w-11 h-11 shrink-0">
          <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
            <circle cx="18" cy="18" r={RING_R} fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r={RING_R}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(Math.min(100, percent) / 100) * RING_C} ${RING_C}`}
              className="transition-all duration-300"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display font-black text-[10.5px] text-slate-800 tabular-nums">
            {percent}%
          </span>
        </div>

        {/* Copy + bar */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[12.5px] text-slate-900 leading-tight">
            Artwork Progress
          </p>
          <p className="text-[10px] text-slate-400 font-sans leading-tight">
            {filledCount} of {totalCount} areas colored
          </p>
          <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-sky-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center shrink-0 divide-x divide-slate-100 border border-slate-200/70 rounded-full overflow-hidden">
          <button
            id="duel-zoom-out-btn"
            type="button"
            aria-label="Zoom out"
            disabled={zoomLevel <= 1}
            onClick={() => onZoomDelta(-0.8)}
            className="w-9 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="duel-zoom-in-btn"
            type="button"
            aria-label="Zoom in"
            disabled={zoomLevel >= maxZoom}
            onClick={() => onZoomDelta(0.8)}
            className="w-9 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
