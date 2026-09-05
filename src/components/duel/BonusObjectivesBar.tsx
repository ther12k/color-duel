import { Check, Clock, AlertCircle } from 'lucide-react';
import { BonusObjective } from '../../types/game';
import { cn } from '../../lib/utils';

interface BonusObjectivesBarProps {
  objectives: BonusObjective[];
  completedObjectiveIds: string[];
  objectiveProgress: Record<string, number>; // objectiveId -> number of completed regions
  elapsedSeconds: number;
}

export function BonusObjectivesBar({
  objectives,
  completedObjectiveIds,
  objectiveProgress,
  elapsedSeconds,
}: BonusObjectivesBarProps) {
  return (
    <div className="w-full bg-slate-50/90 border-b border-slate-200/70 px-2 py-1.5 overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-full justify-between sm:justify-center">
        {objectives.map((obj) => {
          const isDone = completedObjectiveIds.includes(obj.id);
          const currentCount = objectiveProgress[obj.id] || 0;
          const secondsRemaining = Math.max(0, obj.deadlineSeconds - elapsedSeconds);
          const isExpired = !isDone && secondsRemaining === 0;

          // Icon representation
          let iconEmoji = '🎯';
          if (obj.iconType === 'lantern') iconEmoji = '🏮';
          else if (obj.iconType === 'bowl') iconEmoji = '🍜';
          else if (obj.iconType === 'awning') iconEmoji = '🎪';
          else if (obj.iconType === 'dragon') iconEmoji = '🐉';
          else if (obj.iconType === 'cup') iconEmoji = '☕';
          else if (obj.iconType === 'flower') iconEmoji = '🌸';
          else if (obj.iconType === 'star') iconEmoji = '⭐';
          else if (obj.iconType === 'window') iconEmoji = '🏛️';

          return (
            <div
              key={obj.id}
              className={cn(
                'flex-1 min-w-[110px] max-w-[145px] p-1.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all shadow-2xs',
                isDone
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : isExpired
                  ? 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-65'
                  : secondsRemaining <= 10
                  ? 'bg-amber-50 border-amber-300 text-amber-950 animate-pulse'
                  : 'bg-white border-slate-200 text-slate-850'
              )}
            >
              {/* Icon badge */}
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs',
                  isDone
                    ? 'bg-emerald-200/70'
                    : isExpired
                    ? 'bg-slate-200'
                    : 'bg-indigo-50 border border-indigo-100'
                )}
              >
                {iconEmoji}
              </div>

              {/* Title & Bonus points */}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[10.5px] leading-tight truncate">
                  {obj.title}
                </div>
                <div className="flex items-center gap-1 text-[9.5px]">
                  <span className="font-bold text-amber-600">+{obj.bonusPoints}</span>
                  {!isDone && !isExpired && (
                    <span className="text-slate-400">· {secondsRemaining}s</span>
                  )}
                  {isExpired && (
                    <span className="text-slate-400 font-medium">Expired</span>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="shrink-0 flex items-center justify-center">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isExpired ? (
                  <div className="text-[10px] text-slate-400 font-bold">
                    ✕
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-400/60 text-indigo-700 font-bold text-[9px] flex items-center justify-center bg-indigo-50/50">
                    {currentCount}/{obj.totalRegions}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
