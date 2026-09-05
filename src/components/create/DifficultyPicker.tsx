import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type DifficultyType = 'fewer' | 'medium' | 'larger';

interface DifficultyPickerProps {
  selectedDifficulty: DifficultyType;
  onSelectDifficulty: (diff: DifficultyType) => void;
}

export function DifficultyPicker({
  selectedDifficulty,
  onSelectDifficulty,
}: DifficultyPickerProps) {
  const options = [
    {
      id: 'fewer' as DifficultyType,
      title: 'Fewer Details',
      desc: 'Simpler design. Larger, easier areas.',
      icon: '🍃',
    },
    {
      id: 'medium' as DifficultyType,
      title: 'Medium Details',
      desc: 'A balanced challenge for most players.',
      icon: '📊',
    },
    {
      id: 'larger' as DifficultyType,
      title: 'Larger Regions',
      desc: 'Bigger areas. Faster gameplay.',
      icon: '🟦',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 font-display font-bold text-slate-800 text-xs">
        <span>🏔️</span>
        <span>Difficulty Settings</span>
      </div>
      <p className="text-[10.5px] text-slate-400 font-sans -mt-1">
        Adjust the complexity for a fun and fair challenge.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = selectedDifficulty === opt.id;
          return (
            <div
              key={opt.id}
              id={`diff-opt-${opt.id}`}
              onClick={() => onSelectDifficulty(opt.id)}
              className={cn(
                'p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between',
                isSelected
                  ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-300/60 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-lg">{opt.icon}</span>
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    isSelected
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-slate-300'
                  )}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              <div className="mt-2">
                <div className="font-display font-bold text-xs text-slate-800">
                  {opt.title}
                </div>
                <div className="text-[10px] text-slate-500 font-sans leading-tight mt-0.5">
                  {opt.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
