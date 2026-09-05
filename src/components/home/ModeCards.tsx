import { ArrowRight, Trophy, Palette, Brain, Calendar, Sparkles } from 'lucide-react';
import { GameMode } from '../../types/game';

interface ModeCardsProps {
  onSelectMode: (mode: GameMode) => void;
  onSelectDaily: () => void;
}

export function ModeCards({ onSelectMode, onSelectDaily }: ModeCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Solo Mode */}
      <div
        id="mode-card-solo"
        onClick={() => onSelectMode('solo')}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] p-3.5 text-white shadow-md shadow-purple-500/20 cursor-pointer hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[120px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-display font-extrabold text-lg leading-tight tracking-tight">
                Solo Mode
              </h3>
              <span className="bg-amber-300 text-purple-950 font-black text-[9px] px-1.5 py-0.2 rounded-md">
                NEW
              </span>
            </div>
            <p className="text-[11px] text-purple-100/90 leading-tight mt-1 font-sans">
              Zoom & find numbers. Relaxed coloring!
            </p>
          </div>
          <span className="text-2xl drop-shadow-xs">🎨</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1">
          <span className="text-[10px] font-semibold text-purple-200/90 uppercase tracking-wider">
            Self-Paced Art
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-purple-600 transition-colors">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. Arena (Smart Duel) */}
      <div
        id="mode-card-arena"
        onClick={() => onSelectMode('smart-duel')}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] p-3.5 text-white shadow-md shadow-blue-500/20 cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[120px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-extrabold text-lg leading-tight tracking-tight">
              Arena
            </h3>
            <p className="text-[11px] text-blue-100/90 leading-tight mt-1 font-sans">
              Go head-to-head in real-time duels!
            </p>
          </div>
          <span className="text-2xl drop-shadow-xs">🏆</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1">
          <span className="text-[10px] font-semibold text-blue-200/90 uppercase tracking-wider">
            Ranked Duels
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-colors">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. Memory Duel */}
      <div
        id="mode-card-memory"
        onClick={() => onSelectMode('memory-duel')}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EC4899] via-[#DB2777] to-[#BE185D] p-3.5 text-white shadow-md shadow-pink-500/20 cursor-pointer hover:shadow-lg hover:shadow-pink-500/30 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[120px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-extrabold text-lg leading-tight tracking-tight">
              Memory Duel
            </h3>
            <p className="text-[11px] text-pink-100/90 leading-tight mt-1 font-sans">
              Color from memory. Test your recall!
            </p>
          </div>
          <span className="text-2xl drop-shadow-xs">🧠</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1">
          <span className="text-[10px] font-semibold text-pink-200/90 uppercase tracking-wider">
            No Numbers
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-pink-600 transition-colors">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 4. Daily Challenge */}
      <div
        id="mode-card-daily"
        onClick={onSelectDaily}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-3.5 text-white shadow-md shadow-emerald-500/20 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[120px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-extrabold text-lg leading-tight tracking-tight">
              Daily Challenge
            </h3>
            <p className="text-[11px] text-emerald-100/90 leading-tight mt-1 font-sans">
              A new picture every single day!
            </p>
          </div>
          <span className="text-2xl drop-shadow-xs">📅</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1">
          <span className="text-[10px] font-semibold text-emerald-200/90 uppercase tracking-wider">
            Streak Bonus
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-colors">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
