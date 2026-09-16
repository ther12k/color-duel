import { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, LayoutGrid, X, Pipette } from 'lucide-react';
import { ColorPaletteItem } from '../../types/game';
import { cn } from '../../lib/utils';

interface PaletteBarProps {
  palette: ColorPaletteItem[];
  selectedColorIndex: number;
  activePaint: string;
  isStudio: boolean;
  remainingCountByColor: Record<number, number>;
  hintsLeft: number;
  onSelectColor: (colorIndex: number) => void;
  onSelectCustomColor: (hex: string) => void;
  onUseHint: () => void;
}

/** True when a hex is light enough to need dark text on the swatch. */
function isLightHex(hex: string): boolean {
  const h = hex.toLowerCase();
  return (
    h.includes('fff') || h.includes('ffe') || h.includes('ffd') || h.includes('fee')
  );
}

export function PaletteBar({
  palette,
  selectedColorIndex,
  activePaint,
  isStudio,
  remainingCountByColor,
  hintsLeft,
  onSelectColor,
  onSelectCustomColor,
  onUseHint,
}: PaletteBarProps) {
  const [gridOpen, setGridOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const remainingOf = (item: ColorPaletteItem) => remainingCountByColor[item.number] ?? 1;

  // Unfinished colors first (ascending), finished ones pushed to the back —
  // with 40-swatch palettes the playable range stays within thumb's reach.
  const orderedPalette = useMemo(
    () =>
      [...palette].sort(
        (a, b) =>
          (remainingOf(a) > 0 ? 0 : 1) - (remainingOf(b) > 0 ? 0 : 1) || a.number - b.number
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [palette, remainingCountByColor]
  );

  // Keep the selected swatch in view — switching colors from the canvas or
  // grid must not leave the highlighted swatch scrolled out of sight.
  useEffect(() => {
    rowRef.current
      ?.querySelector(`#palette-color-${selectedColorIndex}`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedColorIndex]);

  const renderSwatch = (item: ColorPaletteItem, size: 'bar' | 'grid') => {
    const isSelected = item.number === selectedColorIndex;
    const remaining = remainingOf(item);
    const isFinished = remaining === 0;
    const isLight = isLightHex(item.hex);

    if (size === 'grid') {
      return (
        <button
          key={item.number}
          id={`palette-grid-color-${item.number}`}
          onClick={() => {
            onSelectColor(item.number);
            setGridOpen(false);
          }}
          className={cn(
            'relative aspect-square rounded-2xl flex items-center justify-center font-sans font-extrabold text-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-xs',
            isSelected && 'ring-[3px] ring-teal-600 ring-offset-2 ring-offset-white',
            isFinished && 'opacity-35 grayscale-70'
          )}
          style={{ backgroundColor: item.hex }}
        >
          <span className={isLight ? 'text-slate-900' : 'text-white'}>
            {isFinished ? '✓' : item.number}
          </span>
          {!isFinished && remaining > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-slate-800/90 text-white text-[10px] font-sans font-bold min-w-[18px] h-[18px] px-1 rounded-full border border-white flex items-center justify-center">
              {remaining}
            </span>
          )}
        </button>
      );
    }

    return (
      <button
        key={item.number}
        id={`palette-color-${item.number}`}
        onClick={() => onSelectColor(item.number)}
        className={cn(
          'relative flex items-center justify-center shrink-0 w-12 h-12 rounded-full font-sans font-extrabold text-[17px] transition-all duration-200 cursor-pointer shadow-xs active:scale-95',
          isSelected &&
            'ring-[3px] ring-teal-600 ring-offset-[3px] ring-offset-[#F4F6FB] scale-105 shadow-md',
          isFinished && 'opacity-40 grayscale-30'
        )}
        style={{ backgroundColor: item.hex }}
      >
        <span className={cn('drop-shadow-xs', isLight ? 'text-slate-900' : 'text-white')}>
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
  };

  return (
    <>
      <div className="w-full px-2 pt-1.5 pb-0.5 flex items-center justify-between gap-1.5">
        {/* Palette Colors Carousel / Row */}
        <div ref={rowRef} className="flex items-center gap-2 overflow-x-auto py-1.5 px-1 flex-1 scrollbar-none">
          {orderedPalette.map((item) => renderSwatch(item, 'bar'))}
        </div>

        {/* Action Controls: custom paint / grid / hint */}
        <div className="flex items-center gap-1.5 shrink-0 pr-0.5">
          {isStudio && (
            <label
              className={cn(
                'relative flex flex-col items-center justify-center w-11 h-11 rounded-full border border-slate-200/70 bg-white text-slate-600 shadow-xs cursor-pointer transition-transform active:scale-95',
                selectedColorIndex === -1 && 'ring-[3px] ring-teal-600 ring-offset-2 ring-offset-[#F4F6FB]'
              )}
              title="Choose custom color"
            >
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: activePaint }} />
              <Pipette className="w-4 h-4" />
              <span className="text-[8.5px] font-bold font-sans mt-px">Custom</span>
              <input
                aria-label="Custom paint color"
                type="color"
                value={activePaint}
                onChange={(e) => onSelectCustomColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          )}
          {/* Full palette grid — with 40+ colors the strip alone is unusable */}
          <button
            id="duel-palette-grid-btn"
            onClick={() => setGridOpen(true)}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white border border-slate-200/70 text-slate-600 transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[8.5px] font-bold font-sans mt-px">All</span>
          </button>

          {/* Hint button */}
          <button
            id="duel-hint-btn"
            onClick={onUseHint}
            disabled={hintsLeft <= 0}
            className={cn(
              'relative flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white border border-slate-200/70 text-slate-800 transition-transform active:scale-95 cursor-pointer shadow-xs',
              hintsLeft <= 0 && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Lightbulb className="w-4.5 h-4.5 fill-amber-300 text-amber-400" />
            <span className="text-[8.5px] font-bold font-sans mt-px">Hint</span>
            <span className="absolute -top-1 -right-0.5 bg-teal-500 text-white font-sans font-bold text-[9px] w-4 h-4 rounded-full border-2 border-[#F4F6FB] flex items-center justify-center">
              {hintsLeft}
            </span>
          </button>
        </div>
      </div>

      {/* Full palette grid sheet */}
      {gridOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setGridOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-4 pb-6 shadow-2xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Pick a color</h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Tap the number on the canvas anytime to switch instantly
                </p>
              </div>
              <button
                onClick={() => setGridOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2.5">
              {orderedPalette.map((item) => renderSwatch(item, 'grid'))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
