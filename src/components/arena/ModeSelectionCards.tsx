import { Swords, Zap, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { GameMode } from '../../types/game';

interface ModeSelectionCardsProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenFriendRoom: () => void;
}

export function ModeSelectionCards({
  onSelectMode,
  onOpenFriendRoom,
}: ModeSelectionCardsProps) {
  return (
    <div className="space-y-2.5">
      {/* 1. Smart Duel (Ranked Flagship) */}
      <div
        id="arena-select-smart-duel"
        onClick={() => onSelectMode('smart-duel')}
        className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-md border border-indigo-400/30 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-2xl shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-black text-base text-white">
                Smart Duel
              </h3>
              <span className="bg-amber-400 text-amber-950 font-bold text-[9px] px-1.5 py-0.2 rounded-md uppercase">
                Ranked
              </span>
            </div>
            <p className="text-xs text-indigo-200 font-sans mt-0.5">
              Bonus objectives + deadlines decide the winner!
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* 2. Speed Duel */}
      <div
        id="arena-select-speed-duel"
        onClick={() => onSelectMode('speed-duel')}
        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 active:scale-[0.98] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
            ⚡
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800">
              Speed Duel
            </h4>
            <p className="text-[11px] text-slate-500 font-sans">
              Classic race to finish the entire picture first.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 3. Memory Duel */}
      <div
        id="arena-select-memory-duel"
        onClick={() => onSelectMode('memory-duel')}
        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-purple-300 active:scale-[0.98] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl text-purple-600">
            🧠
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800">
              Memory Duel
            </h4>
            <p className="text-[11px] text-slate-500 font-sans">
              Preview reference for 8s, then color without numbers.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 4. Friend Room & Rematch */}
      <div
        id="arena-select-friend-room"
        onClick={onOpenFriendRoom}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
            👥
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-emerald-950">
              Friend Challenge Room
            </h4>
            <p className="text-[11px] text-emerald-700 font-sans">
              Join with room code or challenge a friend to a locked duel.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-600" />
      </div>
    </div>
  );
}
