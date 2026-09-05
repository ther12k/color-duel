import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ChallengeModeType = 'number' | 'memory' | 'free';

interface ModePickerProps {
  selectedMode: ChallengeModeType;
  onSelectMode: (mode: ChallengeModeType) => void;
}

export function ModePicker({ selectedMode, onSelectMode }: ModePickerProps) {
  const options = [
    {
      id: 'number' as ChallengeModeType,
      title: 'Number Coloring',
      desc: 'Classic color-by-number duel. Fastest wins!',
      icon: '🎨',
      borderClass: 'border-purple-300',
    },
    {
      id: 'memory' as ChallengeModeType,
      title: 'Memory Challenge',
      desc: 'Color from memory. Test your skills!',
      icon: '🧠',
      borderClass: 'border-rose-300',
    },
    {
      id: 'free' as ChallengeModeType,
      title: 'Free Color',
      desc: 'No numbers. Pure creativity!',
      icon: '🖌️',
      borderClass: 'border-blue-300',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 font-display font-bold text-slate-800 text-xs">
        <span>⚔️</span>
        <span>Challenge Mode</span>
      </div>
      <p className="text-[10.5px] text-slate-400 font-sans -mt-1">
        Choose how players will play your artwork!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = selectedMode === opt.id;
          return (
            <div
              key={opt.id}
              id={`challenge-mode-opt-${opt.id}`}
              onClick={() => onSelectMode(opt.id)}
              className={cn(
                'p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between',
                isSelected
                  ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-300/60 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-xl">{opt.icon}</span>
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
