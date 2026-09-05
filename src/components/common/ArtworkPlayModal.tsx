import { useState } from 'react';
import { X, Play, Sparkles } from 'lucide-react';
import { Artwork, GameMode } from '../../types/game';
import { cn } from '../../lib/utils';
import { ArtworkThumbnail } from './ArtworkThumbnail';

interface ArtworkPlayModalProps {
  artwork: Artwork;
  onClose: () => void;
  onStartGame: (artwork: Artwork, mode: GameMode) => void;
}

export function ArtworkPlayModal({
  artwork,
  onClose,
  onStartGame,
}: ArtworkPlayModalProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('solo');

  const modes = [
    {
      id: 'solo' as GameMode,
      title: 'Solo Mode',
      desc: 'No opponent. Zoom in to locate and fill hidden numbers at your pace',
      badge: 'Popular',
      icon: '🎨',
    },
    {
      id: 'smart-duel' as GameMode,
      title: 'Smart Duel',
      desc: 'Ranked VS match with objective deadlines and live scoring',
      badge: 'Arena',
      icon: '👑',
    },
    {
      id: 'memory-duel' as GameMode,
      title: 'Memory Duel',
      desc: 'Preview for 8s, numbers disappear! Test visual recall',
      badge: 'Recall',
      icon: '🧠',
    },
    {
      id: 'speed-duel' as GameMode,
      title: 'Speed Duel',
      desc: 'Fast sprint: who can finish all regions first?',
      badge: 'Race',
      icon: '⚡',
    },
    {
      id: 'studio' as GameMode,
      title: 'Studio Relax',
      desc: 'No opponent, no timer. Pure zen coloring bliss',
      badge: 'Zen',
      icon: '🐱',
    },
  ];

  const isHard = artwork.difficulty === 'Hard';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-display font-black text-slate-800 text-lg">
            Choose Game Mode
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 -mr-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artwork summary */}
        <div className="flex items-center gap-3 my-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white">
            <ArtworkThumbnail artwork={artwork} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-slate-900 text-sm truncate">
              {artwork.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isHard
                    ? 'bg-purple-100 text-purple-800'
                    : artwork.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {artwork.difficulty} Level
              </span>
              <span className="text-[10.5px] text-slate-500 font-sans">
                {artwork.category}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-sans mt-0.5">
              {artwork.regions.length} regions · {artwork.palette.length} colors
            </p>
          </div>
        </div>

        {/* Hard Level Masterpiece Banner */}
        {isHard && (
          <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/80 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <p className="text-[11px] text-purple-900 font-sans leading-tight">
              <strong>Original Painting:</strong> Zoom in on the canvas to find hidden polygon boxes and numbers!
            </p>
          </div>
        )}

        {/* Mode list */}
        <div className="space-y-2 mb-4">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <div
                key={m.id}
                id={`modal-mode-${m.id}`}
                onClick={() => setSelectedMode(m.id)}
                className={cn(
                  'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2',
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300/60 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{m.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-xs text-slate-800">
                        {m.title}
                      </span>
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded-md">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans leading-tight mt-0.5">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-300'
                  )}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <button
          type="button"
          id="modal-start-game-btn"
          onClick={() => onStartGame(artwork, selectedMode)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 font-display font-black text-sm shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-amber-950" />
          <span>Start Playing</span>
        </button>
      </div>
    </div>
  );
}
