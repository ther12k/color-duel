import { Lightbulb, ZoomIn, ZoomOut } from 'lucide-react';
import { ColorPaletteItem } from '../../types/game';
import { cn } from '../../lib/utils';

interface PaletteBarProps {
  palette: ColorPaletteItem[];
  selectedColorIndex: number;
  remainingCountByColor: Record<number, number>;
  hintsLeft: number;
  zoomLevel: number;
  onSelectColor: (colorIndex: number) => void;
  onUseHint: () => void;
  onToggleZoom: () => void;
}

export function PaletteBar({
  palette,
  selectedColorIndex,
  remainingCountByColor,
  hintsLeft,
  zoomLevel,
  onSelectColor,
  onUseHint,
  onToggleZoom,
}: PaletteBarProps) {
  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-between gap-1 shadow-md">
      {/* Palette Colors Carousel / Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 flex-1 scrollbar-none">
        {palette.map((item) => {
          const isSelected = item.number === selectedColorIndex;
          const remaining = remainingCountByColor[item.number] ?? 1;
          const isFinished = remaining === 0;

          // Contrast text calculation
          const isLight =
            item.hex.toLowerCase().includes('fff') ||
            item.hex.toLowerCase().includes('ffe') ||
            item.hex.toLowerCase().includes('ffd') ||
            item.hex.toLowerCase().includes('fee');

          return (
            <button
              key={item.number}
              id={`palette-color-${item.number}`}
              onClick={() => onSelectColor(item.number)}
              className={cn(
                'relative flex items-center justify-center shrink-0 w-11 h-11 rounded-full font-display font-bold text-base transition-all duration-200 cursor-pointer shadow-xs active:scale-95',
                isSelected && 'ring-4 ring-purple-400 ring-offset-2 scale-110 shadow-md',
                isFinished && 'opacity-40 grayscale-30'
              )}
              style={{ backgroundColor: item.hex }}
            >
              <span
                className={cn(
                  'drop-shadow-xs',
                  isLight ? 'text-slate-900' : 'text-white'
                )}
              >
                {isFinished ? '✓' : item.number}
              </span>

              {/* Remaining count badge if not finished */}
              {!isFinished && remaining > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-800/85 text-white text-[9px] font-sans font-bold px-1 rounded-full border border-white">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Controls: Hint & Zoom */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-slate-200">
        {/* Hint button */}
        <button
          id="duel-hint-btn"
          onClick={onUseHint}
          disabled={hintsLeft <= 0}
          className={cn(
            'flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 transition-transform active:scale-95 cursor-pointer shadow-2xs',
            hintsLeft <= 0 && 'opacity-40 cursor-not-allowed'
          )}
        >
          <div className="relative">
            <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {hintsLeft}
            </span>
          </div>
          <span className="text-[9px] font-bold font-sans mt-0.5">Hint</span>
        </button>

        {/* Zoom button */}
        <button
          id="duel-zoom-btn"
          onClick={onToggleZoom}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 transition-transform active:scale-95 cursor-pointer shadow-2xs"
        >
          {zoomLevel > 1 ? (
            <ZoomOut className="w-4 h-4 text-slate-700" />
          ) : (
            <ZoomIn className="w-4 h-4 text-slate-700" />
          )}
          <span className="text-[9px] font-bold font-sans mt-0.5">
            {zoomLevel > 1 ? 'Reset' : 'Zoom'}
          </span>
        </button>
      </div>
    </div>
  );
}
