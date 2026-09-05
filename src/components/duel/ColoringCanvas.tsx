import { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { Artwork, ArtworkRegion, GameMode } from '../../types/game';
import { cn } from '../../lib/utils';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles } from 'lucide-react';

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
  onZoomChange?: (newZoom: number) => void;
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
  onZoomChange,
}: ColoringCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Pan offset in SVG coordinate units (0..500)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null);
  const [showRadarPing, setShowRadarPing] = useState(false);

  const isMemoryMode = mode === 'memory-duel';
  const showNumbers = !isMemoryMode || isPeeking;
  const isHardPainting = artwork.difficulty === 'Hard' || artwork.paintingStyle === 'original-painting';

  // Base canvas coordinate box is 500x500
  const BASE_SIZE = 500;
  const currentZoom = Math.max(1, zoomLevel);
  const viewWidth = BASE_SIZE / currentZoom;
  const viewHeight = BASE_SIZE / currentZoom;
  const maxPanX = (BASE_SIZE - viewWidth) / 2;
  const maxPanY = (BASE_SIZE - viewHeight) / 2;

  // Clamp pan so view doesn't leave the canvas
  const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, pan.x));
  const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, pan.y));

  const viewBoxX = (BASE_SIZE - viewWidth) / 2 + clampedPanX;
  const viewBoxY = (BASE_SIZE - viewHeight) / 2 + clampedPanY;
  const activeViewBox = `${viewBoxX} ${viewBoxY} ${viewWidth} ${viewHeight}`;

  // Reset pan whenever zoom is reset to 1
  useEffect(() => {
    if (zoomLevel <= 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // Mouse & Touch Drag Handlers for Panning when zoomed
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (currentZoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleFactor = viewWidth / rect.width;
    const deltaX = (e.clientX - dragStartRef.current.clientX) * scaleFactor;
    const deltaY = (e.clientY - dragStartRef.current.clientY) * scaleFactor;

    setPan({
      x: dragStartRef.current.panX - deltaX,
      y: dragStartRef.current.panY - deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (currentZoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const scaleFactor = viewWidth / rect.width;
    const deltaX = (touch.clientX - dragStartRef.current.clientX) * scaleFactor;
    const deltaY = (touch.clientY - dragStartRef.current.clientY) * scaleFactor;

    setPan({
      x: dragStartRef.current.panX - deltaX,
      y: dragStartRef.current.panY - deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Quick Zoom buttons
  const setZoom = (z: number) => {
    if (onZoomChange) {
      onZoomChange(z);
    }
  };

  // Find & auto-center on next unfilled polygon of selected color
  const handleLocateTargetColor = () => {
    const targetRegion = artwork.regions.find(
      (r) => r.colorIndex === selectedColorIndex && !filledRegionIds.includes(r.id)
    );

    if (targetRegion) {
      // Zoom in to 2.2x and center on this target polygon
      if (onZoomChange && zoomLevel < 1.8) {
        onZoomChange(2.2);
      }
      const targetPanX = targetRegion.labelPos.x - BASE_SIZE / 2;
      const targetPanY = targetRegion.labelPos.y - BASE_SIZE / 2;
      setPan({ x: targetPanX, y: targetPanY });
      setShowRadarPing(true);
      setTimeout(() => setShowRadarPing(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'relative w-full aspect-square max-w-[480px] mx-auto bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner flex items-center justify-center select-none',
        currentZoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'
      )}
    >
      {/* Floating Penalty / Bonus indicators */}
      {wrongClickPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-xs sm:text-sm text-rose-600 bg-white/95 px-2.5 py-1 rounded-full shadow-lg border border-rose-300 animate-bounce"
          style={{ left: `${wrongClickPos.x}px`, top: `${wrongClickPos.y}px` }}
        >
          -5 Wrong Number!
        </div>
      )}

      {correctClickPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-xs sm:text-sm text-emerald-600 bg-white/95 px-2.5 py-1 rounded-full shadow-lg border border-emerald-300 animate-pulse"
          style={{ left: `${correctClickPos.x}px`, top: `${correctClickPos.y}px` }}
        >
          +10 Box Restored! ✨
        </div>
      )}

      {/* Floating Top Hint for Hard Original Painting Mode */}
      {isHardPainting && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none flex items-center justify-between">
          <div className="bg-slate-900/85 backdrop-blur-md text-amber-300 text-[10px] sm:text-[11px] font-sans font-medium px-2.5 py-1 rounded-full border border-amber-500/30 shadow-md flex items-center gap-1.5 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {currentZoom <= 1
                ? '🔍 Hard: Zoom in & drag to spot hidden polygon numbers'
                : 'Panned view · Tap the numbered box to color'}
            </span>
          </div>
        </div>
      )}

      {/* Floating On-Canvas Zoom & Radar Controls (Top Right) */}
      <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg text-white">
        {/* Radar Locate Button */}
        <button
          type="button"
          onClick={handleLocateTargetColor}
          title="Locate nearest polygon with selected color"
          className="w-7 h-7 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-amber-300 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out Button */}
        <button
          type="button"
          disabled={currentZoom <= 1}
          onClick={() => setZoom(Math.max(1, currentZoom - 0.8))}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Current Zoom Level Pill */}
        <button
          type="button"
          onClick={() => setZoom(currentZoom === 1 ? 1.8 : currentZoom < 2.5 ? 2.8 : 1)}
          className="px-2 py-0.5 text-[11px] font-display font-bold text-amber-300 hover:text-white"
        >
          {currentZoom.toFixed(1)}x
        </button>

        {/* Zoom In Button */}
        <button
          type="button"
          disabled={currentZoom >= 3.2}
          onClick={() => setZoom(Math.min(3.2, currentZoom + 0.8))}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Reset View Button */}
        {currentZoom > 1 && (
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Reset to full view"
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Mini Viewport Indicator (Bottom Left) when zoomed in */}
      {currentZoom > 1 && (
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-slate-900/80 backdrop-blur-xs p-1 rounded-lg border border-white/20">
          <div className="relative w-8 h-8 bg-slate-800 rounded border border-slate-600">
            <div
              className="absolute border-2 border-amber-400 bg-amber-400/25 rounded-xs"
              style={{
                width: `${(1 / currentZoom) * 100}%`,
                height: `${(1 / currentZoom) * 100}%`,
                left: `${((viewBoxX / BASE_SIZE) * 100).toFixed(1)}%`,
                top: `${((viewBoxY / BASE_SIZE) * 100).toFixed(1)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Primary SVG Canvas */}
      <svg
        viewBox={activeViewBox}
        className="w-full h-full transition-all duration-75 ease-out select-none"
      >
        <defs>
          <filter id="box-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.8" />
          </filter>
          <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.8" />
          </filter>
          <pattern id="unfilled-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#64748B" strokeWidth="0.8" strokeOpacity="0.3" />
          </pattern>
        </defs>

        {/* 1. Base Painting / Canvas Layer */}
        {isHardPainting && (artwork.paintingBackground || artwork.thumbnail) ? (
          <image
            href={artwork.paintingBackground || artwork.thumbnail}
            x="0"
            y="0"
            width="500"
            height="500"
            preserveAspectRatio="xMidYMid slice"
            opacity={0.92}
          />
        ) : (
          <rect x="0" y="0" width="500" height="500" fill="#F8F8F7" />
        )}

        {/* 2. Irregular Regions & Polygon Boxes */}
        {artwork.regions.map((region) => {
          const isFilled = filledRegionIds.includes(region.id);
          const colorHex =
            artwork.palette.find((p) => p.number === region.colorIndex)?.hex || '#CCCCCC';
          const isTargetOfSelected = !isFilled && region.colorIndex === selectedColorIndex;
          const isHinted = !isFilled && region.colorIndex === hintActiveForColor;
          const isHovered = hoveredRegionId === region.id;

          // Determine fill and opacity
          let fill = 'transparent';
          let fillOpacity = 1;
          let stroke = '#1E293B';
          let strokeWidth = 1.5;
          let strokeDasharray = undefined;

          if (isHardPainting) {
            if (isFilled || (isMemoryMode && isPeeking)) {
              fill = colorHex;
              fillOpacity = 0.94;
              stroke = '#F59E0B';
              strokeWidth = 1.6;
            } else {
              // Unfilled polygon box on top of the original painting
              fill = isTargetOfSelected ? '#6366F1' : '#0F172A';
              fillOpacity = isTargetOfSelected ? 0.35 : 0.22;
              stroke = isTargetOfSelected ? '#FFFFFF' : '#CBD5E1';
              strokeWidth = isTargetOfSelected ? 2.2 : 1.4;
              strokeDasharray = isTargetOfSelected ? undefined : '4,3';
            }
          } else {
            // Standard Vector Mode
            if (isFilled || (isMemoryMode && isPeeking)) {
              fill = colorHex;
              stroke = '#1E293B';
              strokeWidth = 1.8;
            } else if (isHinted) {
              fill = '#FEF08A';
              stroke = '#EAB308';
              strokeWidth = 2.4;
            } else if (isTargetOfSelected) {
              fill = isHovered ? '#EFF6FF' : '#FFFFFF';
              stroke = '#6366F1';
              strokeWidth = 2.2;
            } else {
              fill = '#F8F8F7';
              stroke = '#475569';
              strokeWidth = 1.5;
            }
          }

          return (
            <g key={region.id} className="transition-all">
              <path
                id={`region-${region.id}`}
                d={region.path}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={cn(
                  'transition-all duration-150 cursor-pointer',
                  !isFilled && 'hover:brightness-110 active:scale-[0.99]',
                  isTargetOfSelected && 'hover:stroke-amber-400',
                  isHinted && 'animate-pulse'
                )}
                onMouseEnter={() => setHoveredRegionId(region.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
                onClick={(e) => onRegionClick(region, e)}
              />

              {/* Number tag badge in the center of the region/polygon box */}
              {!isFilled && showNumbers && (
                <g
                  pointerEvents="none"
                  className={cn(
                    'transition-all',
                    isTargetOfSelected ? 'opacity-100' : 'opacity-85'
                  )}
                >
                  {/* Radar pulse wave around the target color box */}
                  {showRadarPing && isTargetOfSelected && (
                    <circle
                      cx={region.labelPos.x}
                      cy={region.labelPos.y}
                      r={24}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Circle badge */}
                  <circle
                    cx={region.labelPos.x}
                    cy={region.labelPos.y}
                    r={isTargetOfSelected ? 12 : 9.5}
                    fill={isTargetOfSelected ? '#6366F1' : '#FFFFFF'}
                    fillOpacity={isTargetOfSelected ? 0.95 : 0.88}
                    stroke={isTargetOfSelected ? '#FFFFFF' : '#334155'}
                    strokeWidth={isTargetOfSelected ? 1.8 : 1}
                    filter={isTargetOfSelected ? 'url(#box-glow)' : undefined}
                  />

                  {/* Digit Number */}
                  <text
                    x={region.labelPos.x}
                    y={region.labelPos.y + (isTargetOfSelected ? 4 : 3.5)}
                    textAnchor="middle"
                    fill={isTargetOfSelected ? '#FFFFFF' : '#0F172A'}
                    fontSize={isTargetOfSelected ? '12.5px' : '10.5px'}
                    fontWeight="800"
                    fontFamily="Fredoka, system-ui, sans-serif"
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
