import { Clock, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { DuelOpponent, GameMode, UserProfile } from '../../types/game';

interface DuelHUDProps {
  user: UserProfile;
  rival: DuelOpponent;
  playerScore: number;
  timeLeft: number;
  totalTime: number;
  mode: GameMode;
  filledCount?: number;
  totalCount?: number;
  accuracy?: number;
  onExit: () => void;
}

export function DuelHUD({
  user,
  rival,
  playerScore,
  timeLeft,
  totalTime,
  mode,
  filledCount = 0,
  totalCount = 0,
  accuracy = 100,
  onExit,
}: DuelHUDProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const timeProgress = (timeLeft / totalTime) * 100;

  const isSolo = mode === 'solo';
  const isStudio = mode === 'studio';

  const modeTitle =
    mode === 'smart-duel'
      ? 'Smart Duel'
      : mode === 'memory-duel'
      ? 'Memory Duel'
      : mode === 'speed-duel'
      ? 'Speed Duel'
      : mode === 'solo'
      ? 'Solo Mode'
      : 'Studio';

  return (
    <div className="w-full bg-white/95 backdrop-blur-md px-3 pt-2 pb-1.5 border-b border-slate-100 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Left: You Score & Avatar (with quick back button) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            title="Exit match"
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer mr-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-400 shadow-sm">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {!isSolo && !isStudio && (
              <span className="absolute -top-1.5 -left-1 text-xs">👑</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isSolo ? 'Artist' : 'You'}
            </span>
            <div className="flex items-center gap-1">
              {!isSolo && !isStudio && <span className="text-xs">👑</span>}
              <span className="font-display font-black text-base text-indigo-600 leading-tight">
                {isSolo ? `${accuracy}% Acc` : playerScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mode Title & Countdown Timer */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 font-display font-bold text-xs tracking-tight text-slate-800">
            <span>{modeTitle}</span>
            {mode === 'memory-duel' && <span>🧠</span>}
            {mode === 'smart-duel' && <span className="text-amber-500">👑</span>}
            {mode === 'solo' && <span className="text-purple-600">🎨</span>}
          </div>

          {/* Timer pill */}
          <div className="mt-1 relative flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            <span className="font-display font-bold text-sm tracking-widest text-amber-300">
              {timeFormatted}
            </span>

            {/* Subtle progress ring or line */}
            {!isStudio && (
              <div
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, timeProgress))}%` }}
              />
            )}
          </div>
        </div>

        {/* Right: Rival Score (or Solo Progress Counter) */}
        {isSolo || isStudio ? (
          <div className="flex items-center gap-2 flex-row-reverse text-right">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Boxes Done
              </span>
              <div className="flex items-center gap-1 justify-end">
                <span className="font-display font-black text-base text-emerald-600 leading-tight">
                  {filledCount} / {totalCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-row-reverse text-right">
            <div className="relative">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-blue-400 to-cyan-400 shadow-sm">
                <img
                  src={rival.avatar}
                  alt={rival.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute -top-1.5 -right-1 text-xs">👑</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[60px]">
                {rival.name}
              </span>
              <div className="flex items-center gap-1 justify-end">
                <span className="font-display font-black text-base text-blue-600 leading-tight">
                  {rival.score.toLocaleString()}
                </span>
                <span className="text-xs">👑</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
