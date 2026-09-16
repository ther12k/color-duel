import { useState, useRef, useEffect, useMemo, MouseEvent, TouchEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Artwork, ArtworkRegion, GameMode } from '../../types/game';
import { cn } from '../../lib/utils';
import { finishedFillFor } from '../../lib/paints';
import { ArtworkGradientDefs, ArtworkDetailLines, ArtworkDecorations } from '../common/ArtworkPaint';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles } from 'lucide-react';

// Bare number sizing (reference style — no badge circle). Assets authored in
// another coordinate space declare labelFontSize; legacy 500x500 artworks
// fall back to a fixed size.
function numberFontSize(region: ArtworkRegion): number {
  return region.labelFontSize ?? 13;
}

interface ColoringCanvasProps {
  artwork: Artwork;
  filledRegionIds: string[];
  selectedColorIndex: number;
  customRegionColors?: Record<string, string>;
  mode: GameMode;
  isPeeking: boolean;
  hintActiveForColor: number | null;
  wrongClickPos: { x: number; y: number } | null;
  correctClickPos: { x: number; y: number } | null;
  zoomLevel: number;
  onRegionClick: (region: ArtworkRegion, e: MouseEvent) => void;
  /** Tapping a region's number badge selects that color instead of filling. */
  onSelectColor?: (colorIndex: number) => void;
  onZoomChange?: (newZoom: number) => void;
}

export function ColoringCanvas({
  artwork,
  filledRegionIds,
  selectedColorIndex,
  customRegionColors = {},
  mode,
  isPeeking,
  hintActiveForColor,
  wrongClickPos,
  correctClickPos,
  zoomLevel,
  onRegionClick,
  onSelectColor,
  onZoomChange,
}: ColoringCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan offset in SVG coordinate units (0..500)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null);
  const [showRadarPing, setShowRadarPing] = useState(false);

  const isMemoryMode = mode === 'memory-duel';
  // Detailed packs recommend deeper zoom to reach their fine regions.
  const maxZoom = artwork.zoomRecommended ?? 6;
  const showNumbers = !isMemoryMode || isPeeking;
  // In Memory Duel the automatic selection highlight would reveal which regions
  // need the selected color, so it stays hidden unless the player spends a peek.
  // (Numbers and hints use the same rule; paid hints are an explicit assist.)
  const revealSelectionHints = !isMemoryMode || isPeeking;
  // Legacy "hidden polygon" look for Hard artworks. Detailed underpainting
  // artworks are also Hard but render via their own white-mask mode below.
  const isHardPainting =
    !artwork.underpainting &&
    (artwork.difficulty === 'Hard' || artwork.paintingStyle === 'original-painting');

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

  // The SVG letterboxes the square 500-unit canvas inside the container, so
  // css→viewBox conversion uses the uniform rendered scale, not the raw
  // element size (the element is not square when the stage fills the window).
  const dragScale = (rect: { width: number; height: number }) =>
    Math.min(rect.width / viewWidth, rect.height / viewHeight);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = dragScale(rect);
    const deltaX = (e.clientX - dragStartRef.current.clientX) / scale;
    const deltaY = (e.clientY - dragStartRef.current.clientY) / scale;

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
    const scale = dragScale(rect);
    const deltaX = (touch.clientX - dragStartRef.current.clientX) / scale;
    const deltaY = (touch.clientY - dragStartRef.current.clientY) / scale;

    setPan({
      x: dragStartRef.current.panX - deltaX,
      y: dragStartRef.current.panY - deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Desktop trackpads and mouse wheels zoom toward the pointer instead of only
  // changing the scale around the center of the artwork. Attached as a native
  // non-passive listener below — React registers onWheel passively, so
  // preventDefault there could not stop the page from scrolling.
  const wheelZoomRef = useRef<(e: ReactWheelEvent<HTMLDivElement>) => void>(() => {});
  const wheelFrameRef = useRef<number | null>(null);
  const pendingWheelRef = useRef<{ clientX: number; clientY: number; deltaY: number } | null>(null);
  wheelZoomRef.current = (e) => {
    if (!onZoomChange) return;

    // Wheel events can arrive several times per frame on a trackpad. Keep the
    // latest pointer/delta and reconcile the SVG viewBox once per animation
    // frame instead of forcing a full React render for every native event.
    pendingWheelRef.current = { clientX: e.clientX, clientY: e.clientY, deltaY: e.deltaY };
    if (wheelFrameRef.current !== null) return;
    wheelFrameRef.current = window.requestAnimationFrame(() => {
      wheelFrameRef.current = null;
      const pending = pendingWheelRef.current;
      pendingWheelRef.current = null;
      if (!pending || !onZoomChange) return;

      const direction = pending.deltaY < 0 ? 1 : -1;
      const wheelStep = Math.min(0.8, Math.max(0.2, Math.abs(pending.deltaY) / 120 * 0.4));
      const nextZoom = Math.min(
        maxZoom,
        Math.max(1, Math.round((currentZoom + direction * wheelStep) * 10) / 10)
      );
      if (nextZoom === currentZoom) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Map the pointer onto the letterboxed square the viewBox actually
        // renders into (centered when the container is wider/taller than it).
        const squareSide = Math.min(rect.width, rect.height);
        const offsetX = (rect.width - squareSide) / 2;
        const offsetY = (rect.height - squareSide) / 2;
        const pointerX = Math.max(0, Math.min(1, (pending.clientX - rect.left - offsetX) / squareSide));
        const pointerY = Math.max(0, Math.min(1, (pending.clientY - rect.top - offsetY) / squareSide));
        const artworkX = viewBoxX + pointerX * viewWidth;
        const artworkY = viewBoxY + pointerY * viewHeight;
        const nextViewWidth = BASE_SIZE / nextZoom;
        const nextViewHeight = BASE_SIZE / nextZoom;
        const nextViewBoxX = artworkX - pointerX * nextViewWidth;
        const nextViewBoxY = artworkY - pointerY * nextViewHeight;

        setPan({
          x: nextZoom <= 1 ? 0 : nextViewBoxX - (BASE_SIZE - nextViewWidth) / 2,
          y: nextZoom <= 1 ? 0 : nextViewBoxY - (BASE_SIZE - nextViewHeight) / 2,
        });
      }

      onZoomChange(nextZoom);
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (ev: WheelEvent) => wheelZoomRef.current(ev as unknown as ReactWheelEvent<HTMLDivElement>);
    el.addEventListener('wheel', handler, { passive: false });
    return () => {
      el.removeEventListener('wheel', handler);
      if (wheelFrameRef.current !== null) window.cancelAnimationFrame(wheelFrameRef.current);
      wheelFrameRef.current = null;
      pendingWheelRef.current = null;
    };
  }, []);

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
      // Map the label anchor into the 500x500 canvas space (identity for
      // native-canvas artworks; fitTransform mapping for imported assets).
      const fit = artwork.fitParams ?? { scale: 1, tx: 0, ty: 0 };
      const canvasX = targetRegion.labelPos.x * fit.scale + fit.tx;
      const canvasY = targetRegion.labelPos.y * fit.scale + fit.ty;
      // Zoom in to 2.2x and center on this target polygon
      if (onZoomChange && zoomLevel < 1.8) {
        onZoomChange(2.2);
      }
      const targetPanX = canvasX - BASE_SIZE / 2;
      const targetPanY = canvasY - BASE_SIZE / 2;
      setPan({ x: targetPanX, y: targetPanY });
      setShowRadarPing(true);
      setTimeout(() => setShowRadarPing(false), 2000);
    }
  };

  // Per-region visual state, computed once and rendered as separate layers:
  // underpainting -> fills (masks) -> ink -> detail linework -> number badges.
  // With an underpainting (detailed pack), a completed region's mask is simply
  // removed — the finished painting below shows through, exactly clipped.
  const hasUnderpainting = Boolean(artwork.underpainting);
  const decoratedRegions = useMemo(() => artwork.regions.map((region) => {
    const isFilled = filledRegionIds.includes(region.id);
    const isTargetOfSelected =
      revealSelectionHints && !isFilled && region.colorIndex === selectedColorIndex;
    const isHinted = !isFilled && region.colorIndex === hintActiveForColor;

    let fill = 'transparent';
    let fillOpacity = 1;
    const studioPaint = mode === 'studio' ? customRegionColors[region.id] : undefined;
    let stroke = artwork.boundaryStroke ?? '#1E293B';
    let strokeWidth = artwork.boundaryStrokeWidth ?? 1.5;
    let strokeDasharray: string | undefined =
      artwork.boundaryStyle === 'dotted' ? artwork.boundaryDasharray ?? '1.8 2.2' : undefined;

    if (isFilled && studioPaint) {
      fill = studioPaint;
      fillOpacity = 0.94;
      stroke = '#1E293B';
      strokeWidth = 1.8;
    } else if (isHardPainting) {
      if (isFilled || (isMemoryMode && isPeeking)) {
        fill = finishedFillFor(artwork, region.colorIndex);
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
    } else if (hasUnderpainting) {
      // Underpainting mode: fills act as masks over the shared painting.
      if (isFilled || (isMemoryMode && isPeeking)) {
        fill = studioPaint || 'transparent'; // Studio paint overrides shared underpainting
        stroke = '#3F4E54';
        strokeWidth = 0.8;
      } else if (isHinted) {
        fill = '#FEF08A';
        fillOpacity = 0.9;
        stroke = '#EAB308';
        strokeWidth = 2;
      } else if (isTargetOfSelected) {
        fill = `url(#target-checker-${artwork.id})`;
        stroke = '#6366F1';
        strokeWidth = 1.6;
      } else {
        fill = '#FFFFFF'; // opaque mask hides the underpainting
        stroke = '#5B6B72';
        strokeWidth = 1.3;
      }
    } else {
      // Standard Vector Mode
      if (isFilled || (isMemoryMode && isPeeking)) {
        fill = studioPaint || finishedFillFor(artwork, region.colorIndex);
        stroke = '#1E293B';
        strokeWidth = 1.8;
      } else if (isHinted) {
        fill = '#FEF08A';
        stroke = '#EAB308';
        strokeWidth = 2.4;
      } else if (isTargetOfSelected) {
        fill = `url(#target-checker-${artwork.id})`;
        stroke = '#6366F1';
        strokeWidth = 2.2;
      } else {
        fill = artwork.backgroundColor || '#F8F8F7';
        stroke = '#475569';
        strokeWidth = 1.5;
      }
    }

    return {
      region,
      isFilled,
      isTargetOfSelected,
      isHinted,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeDasharray,
    };
  }), [artwork, filledRegionIds, selectedColorIndex, customRegionColors, hintActiveForColor, isMemoryMode, isPeeking, revealSelectionHints, isHardPainting, hasUnderpainting]);

  // Zoom-gated labels (detailed pack): a number shows only once its on-screen
  // height reaches the pack's readability floor; the matching-color highlight
  // stays visible regardless.
  const elWidth = containerRef.current?.clientWidth ?? 440;
  const elHeight = containerRef.current?.clientHeight ?? 440;
  const containerPx = Math.min(elWidth, elHeight);
  const fitScale = artwork.fitParams?.scale ?? 1;
  const cssPerArtworkUnit = (containerPx * currentZoom * fitScale) / BASE_SIZE;
  const labelVisibleAt = (region: ArtworkRegion) => {
    if (!artwork.labelMinScreenPx) return true;
    // Reference-style: numbers stay visible from the fit view like printed
    // color-by-number pages. Only suppress truly unreadable dots (dense
    // Master maps at low zoom) until the player zooms in.
    const floor = Math.min(artwork.labelMinScreenPx, 4);
    return (region.labelFontSize ?? 10) * cssPerArtworkUnit >= floor;
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
        'relative w-full h-full bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm flex items-center justify-center select-none touch-none',
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

      {/* Floating On-Canvas Zoom & Radar Controls (Bottom Right) */}
      <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200/80 shadow-md text-slate-700">
        {/* Radar Locate Button */}
        <button
          type="button"
          onClick={handleLocateTargetColor}
          title="Locate nearest polygon with selected color"
          className="w-7 h-7 rounded-full bg-teal-500/90 hover:bg-teal-500 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out Button */}
        <button
          type="button"
          disabled={currentZoom <= 1}
          onClick={() => setZoom(Math.max(1, currentZoom - 0.8))}
          className="w-7 h-7 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset View Button — centered between zoom out and zoom in */}
        <button
          type="button"
          disabled={currentZoom <= 1}
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset to full view"
          className="w-7 h-7 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {/* Zoom In Button */}
        <button
          type="button"
          disabled={currentZoom >= maxZoom}
          onClick={() => setZoom(Math.min(maxZoom, currentZoom + 0.8))}
          className="w-7 h-7 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Current Zoom Level Pill */}
        <button
          type="button"
          onClick={() => setZoom(currentZoom === 1 ? 1.8 : currentZoom < maxZoom / 2 ? maxZoom / 2 : 1)}
          className="px-1.5 py-0.5 text-[10.5px] font-display font-bold text-slate-500 hover:text-slate-800"
        >
          {currentZoom.toFixed(1)}x
        </button>
      </div>

      {/* Mini Viewport Indicator (Bottom Left) when zoomed in */}
      {currentZoom > 1 && (
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/80 shadow-sm">
          <div className="relative w-8 h-8 bg-slate-100 rounded border border-slate-300">
            <div
              className="absolute border-2 border-teal-500 bg-teal-500/20 rounded-xs"
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
          {/* Checkerboard clipped onto every unfilled region matching the selected
              color group — the signature selection highlight of the reference app. */}
          <pattern id={`target-checker-${artwork.id}`} width="9" height="9" patternUnits="userSpaceOnUse">
            <rect width="9" height="9" fill="#FFFFFF" />
            <path d="M0 0H4.5V4.5H0Z M4.5 4.5H9V9H4.5Z" fill="#C3CAD3" />
          </pattern>
          <ArtworkGradientDefs artwork={artwork} />
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
          <rect x="0" y="0" width="500" height="500" fill={artwork.backgroundColor || '#F8F8F7'} />
        )}

        {/* All artwork geometry lives in one group: letterboxed onto the 500x500
            canvas via fitTransform when the asset uses another coordinate space. */}
        <g transform={artwork.fitTransform}>
        {/* 2. Vector Underpainting (detailed pack): the finished painting, drawn
            once below the masks. Completed regions reveal exactly this. */}
        {artwork.underpainting && (
          <g pointerEvents="none">
            {artwork.underpainting.paths.map((p, i) => (
              <path key={`up-${i}`} d={p.d} fill={p.fill} fillRule={p.fillRule} />
            ))}
          </g>
        )}

        {/* 3. Region Masks & Tappable Paths */}
        {decoratedRegions.map(
          ({
            region,
            isFilled,
            isTargetOfSelected,
            isHinted,
            fill,
            fillOpacity,
            stroke,
            strokeWidth,
            strokeDasharray,
          }) => (
            <path
              id={`region-${region.id}`}
              key={region.id}
              d={region.path}
              fill={fill}
              fillOpacity={fillOpacity}
              fillRule={region.fillRule}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
              className={cn(
                'transition-all duration-150 cursor-pointer',
                !isFilled && 'hover:brightness-110 active:scale-[0.99]',
                isTargetOfSelected && 'hover:stroke-amber-400',
                isHinted && 'animate-pulse'
              )}
              onClick={(e) => onRegionClick(region, e)}
            />
          )
        )}

        {/* 3b. Source Ink Layer (detailed pack): linework above the masks so
               completed regions keep their crisp outlines. */}
        {artwork.underpainting && artwork.underpainting.inkPaths.length > 0 && (
          <g pointerEvents="none">
            {artwork.underpainting.inkPaths.map((p, i) => (
              <path key={`ink-${i}`} d={p.d} fill={p.fill} fillRule={p.fillRule} />
            ))}
          </g>
        )}

        {/* 4. Precolored Decorative Shapes (always finished paint, not tappable) */}
        <ArtworkDecorations artwork={artwork} />

        {/* 5. Decorative Detail Linework (above fills, below labels, not tappable) */}
        <ArtworkDetailLines artwork={artwork} />

        {/* 5b. Artificial subdivision cuts (subdivided masters): dotted so the
               player can tell generated puzzle edges from the real contours. */}
        {artwork.cutPaths && artwork.cutPaths.length > 0 && (
          <g
            id={`cuts-${artwork.id}`}
            fill="none"
            stroke="#64748B"
            strokeWidth={1}
            strokeDasharray="1.6 2.4"
            strokeLinecap="round"
            opacity={0.75}
            pointerEvents="none"
          >
            {artwork.cutPaths.map((d, i) => (
              <path key={`cut-${i}`} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        )}

        {/* 6. Region Numbers (topmost; zoom-gated for detailed packs). Bare
            bold digits on the paper — no badge circles. Tapping a number
            selects its color instead of attempting a fill; tapping anywhere
            else in the region fills it. */}
        {decoratedRegions.map(
          ({ region, isFilled, isTargetOfSelected }) =>
            !isFilled &&
            showNumbers &&
            labelVisibleAt(region) && (
              <g
                key={`label-${region.id}`}
                pointerEvents="none"
                className={cn(
                  'transition-all',
                  isTargetOfSelected ? 'opacity-100' : 'opacity-90'
                )}
              >
                {/* Radar pulse wave around the located target */}
                {showRadarPing && isTargetOfSelected && (
                  <circle
                    cx={region.labelPos.x}
                    cy={region.labelPos.y}
                    r={numberFontSize(region) * 1.4}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    className="animate-ping origin-center"
                  />
                )}

                {/* The digit itself: near-black, heavy weight, white halo so
                    it stays readable over the checkerboard highlight. */}
                <text
                  x={region.labelPos.x}
                  y={region.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isTargetOfSelected ? '#312E81' : '#111827'}
                  stroke={isTargetOfSelected ? '#FFFFFF' : '#FAFAFA'}
                  strokeWidth={artwork.labelStrokeWidth ?? numberFontSize(region) * 0.14}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  fontSize={`${numberFontSize(region).toFixed(1)}px`}
                  fontWeight={artwork.labelFontWeight ?? 800}
                  fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                  pointerEvents="auto"
                  className="cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectColor?.(region.colorIndex);
                  }}
                >
                  {region.colorIndex}
                </text>
              </g>
            )
        )}
        </g>
      </svg>
    </div>
  );
}
