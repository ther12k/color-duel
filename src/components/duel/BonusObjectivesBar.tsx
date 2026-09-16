import { Check, Coffee, Landmark, Lamp, Flame, Flower2, Gem, Soup, Star, Store } from 'lucide-react';
import { BonusObjective } from '../../types/game';
import { cn } from '../../lib/utils';

interface BonusObjectivesBarProps {
  objectives: BonusObjective[];
  completedObjectiveIds: string[];
  objectiveProgress: Record<string, number>; // objectiveId -> number of completed regions
  elapsedSeconds: number;
}

const OBJECTIVE_ICONS = {
  cup: Coffee,
  lantern: Lamp,
  bowl: Soup,
  awning: Store,
  dragon: Flame,
  flower: Flower2,
  window: Landmark,
  star: Star,
  gem: Gem,
} as const;

/** "Tactical Objectives" card — per-objective chips with mini progress bars and bonus values. */
export function BonusObjectivesBar({
  objectives,
  completedObjectiveIds,
  objectiveProgress,
  elapsedSeconds,
}: BonusObjectivesBarProps) {
  if (objectives.length === 0) return null;

  return (
    <div className="px-2.5 pt-0.5">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-sans font-bold tracking-[0.18em] text-slate-500 uppercase">
            Tactical Objectives
          </span>
          <span className="text-[10px] font-sans font-semibold text-emerald-600">
            + Bonus Points
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {objectives.map((obj) => {
            const isDone = completedObjectiveIds.includes(obj.id);
            const currentCount = Math.min(objectiveProgress[obj.id] || 0, obj.totalRegions);
            const secondsRemaining = Math.max(0, obj.deadlineSeconds - elapsedSeconds);
            const isExpired = !isDone && secondsRemaining === 0;
            const Icon = OBJECTIVE_ICONS[obj.iconType] ?? Star;
            const percent = (currentCount / Math.max(1, obj.totalRegions)) * 100;

            return (
              <div
                key={obj.id}
                className={cn(
                  'p-2 rounded-xl border transition-all',
                  isDone
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : isExpired
                    ? 'bg-slate-50 border-slate-200/70 opacity-55'
                    : 'bg-slate-50/80 border-slate-200/70'
                )}
              >
                <div className="flex items-start gap-1.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 mt-px',
                      isDone ? 'text-emerald-600' : isExpired ? 'text-slate-400' : 'text-slate-700'
                    )}
                  />
                  <p className="text-[9.5px] font-sans font-semibold leading-tight text-slate-800 line-clamp-2">
                    {obj.title}
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-[9px] font-sans font-bold text-slate-600 tabular-nums shrink-0">
                    {isDone ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : `${currentCount}/${obj.totalRegions}`}
                  </span>
                  <div className="flex-1 h-1 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        isDone ? 'bg-emerald-500' : 'bg-teal-400'
                      )}
                      style={{ width: `${isDone ? 100 : percent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-sans font-bold text-emerald-600 shrink-0">
                    +{obj.bonusPoints}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
