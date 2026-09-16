import { useRef, useState, TouchEvent, MouseEvent } from 'react';
import { ArrowLeft, Eye, Palette } from 'lucide-react';
import { Artwork } from '../../types/game';
import { cn } from '../../lib/utils';

/** Perceived brightness 0..1 to choose readable chip text color. */
function luminance(hex: string): number {
  const m = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

interface ArtworkPreviewScreenProps {
  artwork: Artwork;
  onExit: () => void;
}

/**
 * Viewer for image-based artwork packages that do not ship region data yet
 * (see docs in the artwork pack). Pan + pinch/scroll zoom over the numbered
 * lineart, with a toggle to the finished colored master. When region paths
 * are authored for the package, the same artwork becomes fully playable via
 * ColoringCanvas with no UI rewrite.
 */
export function ArtworkPreviewScreen({ artwork, onExit }: ArtworkPreviewScreenProps) {
  const [showFinished, setShowFinished] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const pinchStart = useRef<number | null>(null);

  const src = showFinished
    ? artwork.imageReference!.previewColored
    : artwork.imageReference!.previewNumbered;

  const clampPan = (p: { x: number; y: number }, z: number) => {
    const maxX = (z - 1) * 160; // half of the 320px-wide content box per axis
    const maxY = (z - 1) * 260;
    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    };
  };

  const handleMouseDown = (e: MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStart.current || zoom <= 1) return;
    setPan(
      clampPan(
        {
          x: dragStart.current.panX + (e.clientX - dragStart.current.x),
          y: dragStart.current.panY + (e.clientY - dragStart.current.y),
        },
        zoom
      )
    );
  };
  const handleMouseUp = () => {
    dragStart.current = null;
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinchStart.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    } else if (e.touches.length === 1) {
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setZoom((z) => Math.max(1, Math.min(4, z * (dist / pinchStart.current!))));
      pinchStart.current = dist;
    } else if (e.touches.length === 1 && dragStart.current && zoom > 1) {
      setPan(
        clampPan(
          {
            x: dragStart.current.panX + (e.touches[0].clientX - dragStart.current.x),
            y: dragStart.current.panY + (e.touches[0].clientY - dragStart.current.y),
          },
          zoom
        )
      );
    }
  };
  const handleTouchEnd = () => {
    dragStart.current = null;
    pinchStart.current = null;
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F6F6F4] flex flex-col">
      {/* Top bar: back, title, progress placeholder, palette count */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-2.5 flex items-center gap-2.5 shadow-xs">
        <button
          type="button"
          onClick={onExit}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-700" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-bold text-slate-800 text-sm truncate">{artwork.title}</h2>
          <p className="text-[10.5px] text-slate-400 font-sans">
            {artwork.difficulty} · {artwork.palette.length} colors · {artwork.category}
          </p>
        </div>
      </header>

      {/* Canvas viewer */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden px-3 py-4 select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-[320px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <img
            src={src}
            alt={showFinished ? `${artwork.title} finished preview` : `${artwork.title} numbered lineart`}
            className="w-full transition-transform duration-100 origin-center"
            style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom bar: palette chips + state toggle */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-3 space-y-2.5 shadow-lg">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {artwork.palette.map((p) => (
            <div
              key={p.number}
              title={`${p.number} · ${p.name}`}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center shrink-0"
              style={{ backgroundColor: p.hex }}
            >
              <span
                className={cn(
                  'text-[10px] font-black',
                  luminance(p.hex) > 0.45 ? 'text-slate-800' : 'text-white'
                )}
              >
                {p.number}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFinished((s) => !s)}
            className={cn(
              'flex-1 py-2.5 rounded-2xl font-display font-bold text-[12.5px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              showFinished
                ? 'bg-slate-900 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
            )}
          >
            {showFinished ? (
              <>
                <Palette className="w-4 h-4" />
                Show Numbered Art
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview Finished
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-400 font-sans w-24 leading-tight">
            Region data coming soon — preview only.
          </span>
        </div>
      </footer>
    </div>
  );
}
