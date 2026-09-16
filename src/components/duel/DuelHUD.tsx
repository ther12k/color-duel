import { ArrowLeft, CheckCircle2, Crown } from 'lucide-react';
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
  playerPercent?: number;
  rivalPercent?: number;
  onExit: () => void;
}

const TIMER_R = 34;
const TIMER_C = 2 * Math.PI * TIMER_R;

/** In-match top chrome: mini brand, player vs rival scoreboard and the timer ring. */
export function DuelHUD({
  user,
  rival,
  playerScore,
  timeLeft,
  totalTime,
  mode,
  filledCount = 0,
  totalCount = 0,
  playerPercent = 0,
  rivalPercent = 0,
  onExit,
}: DuelHUDProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const timeFraction = Math.max(0, Math.min(1, totalTime > 0 ? timeLeft / totalTime : 0));

  const isSolo = mode === 'solo' || mode === 'studio';

  const modeTitle =
    mode === 'smart-duel'
      ? 'Smart Duel'
      : mode === 'memory-duel'
      ? 'Memory Duel'
      : mode === 'speed-duel'
      ? 'Speed Duel'
      : mode === 'solo'
      ? 'Solo'
      : 'Studio';

  const renderScoreBlock = (
    side: 'left' | 'right',
    avatar: string,
    name: string,
    level: number,
    score: string,
    percent: number,
    barClass: string
  ) => (
    <div
      className={
        side === 'right'
          ? 'flex items-start gap-2 flex-row-reverse min-w-0'
          : 'flex items-start gap-2 min-w-0'
      }
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
        />
        <span className="bg-white border border-slate-200/80 text-slate-500 text-[8.5px] font-sans font-bold px-1.5 py-px rounded-full shadow-xs">
          Lv. {level}
        </span>
      </div>
      <div className={side === 'right' ? 'min-w-0 flex-1 pt-0.5 text-right' : 'min-w-0 flex-1 pt-0.5'}>
        <p className="text-[10px] font-sans font-semibold text-slate-500 leading-tight truncate max-w-[68px]">
          {name}
        </p>
        <p className="font-display font-black text-[19px] text-slate-900 leading-tight tabular-nums">
          {score}
        </p>
        <div className="mt-1 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barClass} ${
              side === 'right' ? 'ml-auto' : ''
            }`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#F4F6FB] px-3 pt-2 pb-1">
      {/* Row 1: back · mini brand */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={onExit}
          title="Exit match"
          className="w-7 h-7 rounded-full bg-white border border-slate-200/70 text-slate-600 flex items-center justify-center hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center leading-none">
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="font-display font-black text-[14px] tracking-tight text-slate-900">
            Color <span className="text-teal-500">Duel</span>
          </span>
        </div>
        <div className="w-7" />
      </div>

      {/* Row 2: scoreboard + timer ring */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {renderScoreBlock(
          'left',
          user.avatar,
          'You',
          user.level,
          playerScore.toLocaleString(),
          playerPercent,
          'bg-gradient-to-r from-teal-400 to-emerald-500'
        )}

        {/* Timer ring */}
        <div className="relative w-[84px] h-[84px] shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="hud-timer-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r={TIMER_R} fill="white" stroke="#E2E8F0" strokeWidth="5" />
            <circle
              cx="40"
              cy="40"
              r={TIMER_R}
              fill="none"
              stroke="url(#hud-timer-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${timeFraction * TIMER_C} ${TIMER_C}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-black text-[17px] text-slate-900 tabular-nums leading-none">
              {timeFormatted}
            </span>
            <span className="text-[8px] font-sans font-bold text-slate-400 mt-1 uppercase tracking-wide">
              {modeTitle}
            </span>
          </div>
        </div>

        {isSolo ? (
          // Relaxed modes: colored-boxes counter instead of a rival.
          <div className="flex items-start gap-2 flex-row-reverse min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200/70 flex items-center justify-center text-emerald-500 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="bg-white border border-slate-200/80 text-slate-500 text-[8.5px] font-sans font-bold px-1.5 py-px rounded-full shadow-xs">
                Lv. {user.level}
              </span>
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-right">
              <p className="text-[10px] font-sans font-semibold text-slate-500 leading-tight">
                Colored
              </p>
              <p className="font-display font-black text-[19px] text-slate-900 leading-tight tabular-nums">
                {filledCount}/{totalCount}
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                <div
                  className="ml-auto h-full rounded-full bg-gradient-to-l from-sky-400 to-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, playerPercent)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          renderScoreBlock(
            'right',
            rival.avatar,
            rival.name,
            rival.level,
            rival.score.toLocaleString(),
            rivalPercent,
            'bg-gradient-to-l from-indigo-400 to-violet-500'
          )
        )}
      </div>
    </div>
  );
}
