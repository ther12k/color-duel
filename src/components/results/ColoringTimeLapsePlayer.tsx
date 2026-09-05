import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Maximize2, Minimize2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Artwork, DuelResult } from '../../types/game';

interface ColoringTimeLapsePlayerProps {
  artwork: Artwork;
  result: DuelResult;
  autoPlay?: boolean;
}

export function ColoringTimeLapsePlayer({
  artwork,
  result,
  autoPlay = true,
}: ColoringTimeLapsePlayerProps) {
  // Determine coloring order
  const regionSequence = useRef<string[]>(
    result.coloringOrder && result.coloringOrder.length > 0
      ? result.coloringOrder
      : artwork.regions.map((r) => r.id)
  ).current;

  const totalSteps = regionSequence.length;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2); // 1x, 2x, 4x
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [justFinished, setJustFinished] = useState<boolean>(false);

  // Set of currently filled region IDs up to currentStep
  const visibleRegionIds = new Set(regionSequence.slice(0, currentStep));

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      setJustFinished(true);
      return;
    }

    // Interval time based on speed: base 100ms / speed
    const intervalMs = Math.max(30, Math.floor(120 / speedMultiplier));

    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          setIsPlaying(false);
          setJustFinished(true);
        }
        return next;
      });
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, speedMultiplier]);

  const handlePlayPause = () => {
    if (currentStep >= totalSteps) {
      // Replay from beginning
      setCurrentStep(0);
      setJustFinished(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setJustFinished(false);
    setIsPlaying(true);
  };

  const handleSpeedToggle = () => {
    setSpeedMultiplier((curr) => (curr === 1 ? 2 : curr === 2 ? 4 : 1));
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4'
    : 'relative w-full bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex flex-col space-y-3';

  return (
    <div className={containerClasses}>
      {/* Header Info */}
      <div className="w-full flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm tracking-wide flex items-center gap-1.5">
            <span>Coloring Time-Lapse Replay</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
            {progressPercent}% Complete
          </span>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-white" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Replay Viewport */}
      <div
        className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner flex items-center justify-center ${
          isFullscreen ? 'max-w-xl max-h-[70vh]' : ''
        }`}
      >
        <svg
          viewBox={artwork.viewBox || '0 0 500 500'}
          className="w-full h-full select-none"
        >
          <defs>
            <filter id="bloom-flash" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Crisp Paper White Background */}
          <rect width="500" height="500" fill="#FFFFFF" />

          {/* Regions Rendered */}
          {artwork.regions.map((region) => {
            const isFilled = visibleRegionIds.has(region.id);
            const paletteItem = artwork.palette.find((p) => p.number === region.colorIndex);
            const fillColor = isFilled ? paletteItem?.hex || '#6366F1' : '#FFFFFF';

            // Check if this region was just colored in this exact step
            const isLatestStep =
              currentStep > 0 && regionSequence[currentStep - 1] === region.id;

            return (
              <g key={region.id}>
                <path
                  d={region.path}
                  fill={fillColor}
                  stroke="#18181B"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-colors duration-150"
                  filter={isLatestStep ? 'url(#bloom-flash)' : undefined}
                />

                {/* Show uncolored numbers on regions that haven't been colored yet */}
                {!isFilled && (
                  <text
                    x={region.labelPos.x}
                    y={region.labelPos.y + 3.5}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="11px"
                    fontWeight="700"
                    fontFamily="Fredoka, system-ui, sans-serif"
                    pointerEvents="none"
                    opacity={0.65}
                  >
                    {region.colorIndex}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Completion Celebration Overlay Banner */}
        {justFinished && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white animate-in fade-in duration-300 p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-2 animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-amber-300 drop-shadow-md text-center">
              Masterpiece Completed!
            </h3>
            <p className="text-xs text-slate-100 mt-1 font-sans text-center">
              Time-lapse coloring replay finished.
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-display font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Watch Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Replay Controls & Timeline Bar */}
      <div className={`w-full space-y-2 ${isFullscreen ? 'max-w-xl text-white' : ''}`}>
        {/* Scrubber Slider */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={totalSteps}
            value={currentStep}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentStep(val);
              setJustFinished(val === totalSteps);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <span className="font-display font-bold text-xs text-slate-500 shrink-0 w-12 text-right">
            {currentStep}/{totalSteps}
          </span>
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={handleRestart}
              title="Restart from beginning"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle Pill */}
          <button
            type="button"
            onClick={handleSpeedToggle}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5 text-purple-600" />
            <span>{speedMultiplier}x Speed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
