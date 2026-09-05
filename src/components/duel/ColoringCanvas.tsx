import { useState, useRef, MouseEvent } from 'react';
import { Artwork, ArtworkRegion, GameMode } from '../../types/game';
import { cn } from '../../lib/utils';

interface ColoringCanvasProps {
  artwork: Artwork;
  filledRegionIds: string[];
  selectedColorIndex: number;
  mode: GameMode;
  isPeeking: boolean;
  hintActiveForColor: number | null;
  wrongClickPos: { x: number; y: number } | null;
  correctClickPos: { x: number; y: number } | null;
  zoomLevel: number;
  onRegionClick: (region: ArtworkRegion, e: MouseEvent) => void;
}

export function ColoringCanvas({
  artwork,
  filledRegionIds,
  selectedColorIndex,
  mode,
  isPeeking,
  hintActiveForColor,
  wrongClickPos,
  correctClickPos,
  zoomLevel,
  onRegionClick,
}: ColoringCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const isMemoryMode = mode === 'memory-duel';
  const showNumbers = !isMemoryMode || isPeeking;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[480px] mx-auto bg-[#FBFBFA] rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner flex items-center justify-center select-none touch-none"
    >
      {/* Floating Penalty / Bonus indicators */}
      {wrongClickPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-sm text-rose-600 bg-white/90 px-2 py-0.5 rounded-full shadow-md border border-rose-200 animate-bounce"
          style={{ left: `${wrongClickPos.x}px`, top: `${wrongClickPos.y}px` }}
        >
          -5 Wrong Color!
        </div>
      )}

      {correctClickPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-sm text-emerald-600 bg-white/90 px-2 py-0.5 rounded-full shadow-md border border-emerald-200 animate-pulse"
          style={{ left: `${correctClickPos.x}px`, top: `${correctClickPos.y}px` }}
        >
          +10 ✨
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox={artwork.viewBox || '0 0 500 500'}
        className="w-full h-full cursor-pointer transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Render each irregular enclosed region */}
        {artwork.regions.map((region) => {
          const isFilled = filledRegionIds.includes(region.id);
          const colorHex =
            artwork.palette.find((p) => p.number === region.colorIndex)?.hex || '#CCCCCC';
          const isTargetOfSelected = !isFilled && region.colorIndex === selectedColorIndex;
          const isHinted = !isFilled && region.colorIndex === hintActiveForColor;
          const isHovered = hoveredRegionId === region.id;

          // Determine fill color
          let fill = '#F8F8F7';
          if (isFilled || (isMemoryMode && isPeeking)) {
            fill = colorHex;
          } else if (isHinted) {
            fill = '#FEF08A'; // glowing yellow hint
          } else if (isTargetOfSelected && isHovered) {
            fill = '#EFF6FF';
          }

          return (
            <g key={region.id} className="transition-colors">
              <path
                id={`region-${region.id}`}
                d={region.path}
                fill={fill}
                stroke={isFilled ? '#1E293B' : isTargetOfSelected ? '#6366F1' : '#334155'}
                strokeWidth={isTargetOfSelected ? 2.5 : 1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={cn(
                  'transition-all duration-150',
                  !isFilled && 'hover:brightness-95 active:brightness-90',
                  isHinted && 'animate-pulse'
                )}
                onMouseEnter={() => setHoveredRegionId(region.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
                onClick={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    onRegionClick(region, e);
                  }
                }}
              />

              {/* Number Label inside the region if unfilled & numbers allowed */}
              {!isFilled && showNumbers && (
                <g
                  pointerEvents="none"
                  className={cn(
                    'transition-opacity',
                    isTargetOfSelected ? 'opacity-100 font-extrabold' : 'opacity-80'
                  )}
                >
                  <circle
                    cx={region.labelPos.x}
                    cy={region.labelPos.y}
                    r={isTargetOfSelected ? 11 : 9.5}
                    fill={isTargetOfSelected ? '#6366F1' : '#FFFFFF'}
                    fillOpacity={isTargetOfSelected ? 0.95 : 0.85}
                    stroke={isTargetOfSelected ? '#FFFFFF' : '#64748B'}
                    strokeWidth={1}
                  />
                  <text
                    x={region.labelPos.x}
                    y={region.labelPos.y + 3.5}
                    textAnchor="middle"
                    fill={isTargetOfSelected ? '#FFFFFF' : '#1E293B'}
                    fontSize={isTargetOfSelected ? '12px' : '10.5px'}
                    fontWeight="bold"
                    fontFamily="Fredoka, sans-serif"
                  >
                    {region.colorIndex}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
