import { Heart, Castle, Trees, Coffee, LayoutGrid, Mountain } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StyleOption {
  id: string;
  label: string;
  icon: string;
  bgClass: string;
  textClass: string;
}

const STYLES: StyleOption[] = [
  { id: 'cute', label: 'Cute', icon: '💖', bgClass: 'bg-rose-50 border-rose-200', textClass: 'text-rose-700' },
  { id: 'fantasy', label: 'Fantasy', icon: '🏰', bgClass: 'bg-purple-50 border-purple-200', textClass: 'text-purple-700' },
  { id: 'nature', label: 'Nature', icon: '🍃', bgClass: 'bg-emerald-50 border-emerald-200', textClass: 'text-emerald-700' },
  { id: 'cozy', label: 'Cozy', icon: '☕', bgClass: 'bg-amber-50 border-amber-200', textClass: 'text-amber-700' },
  { id: 'easy', label: 'Easy Regions', icon: '🟦', bgClass: 'bg-blue-50 border-blue-200', textClass: 'text-blue-700' },
  { id: 'hard', label: 'Hard Regions', icon: '🌋', bgClass: 'bg-red-50 border-red-200', textClass: 'text-red-700' },
];

interface QuickStylesProps {
  selectedStyle: string;
  onSelect: (styleId: string) => void;
}

export function QuickStyles({ selectedStyle, onSelect }: QuickStylesProps) {
  return (
    <div className="space-y-1.5">
      <span className="font-display font-bold text-slate-800 text-xs flex items-center gap-1">
        <span>🎨</span> Quick Styles
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STYLES.map((st) => {
          const isSelected = selectedStyle === st.id;
          return (
            <button
              key={st.id}
              id={`style-btn-${st.id}`}
              onClick={() => onSelect(st.id)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-xl border font-display font-bold text-xs transition-all cursor-pointer active:scale-95',
                st.bgClass,
                st.textClass,
                isSelected && 'ring-2 ring-purple-500 shadow-xs'
              )}
            >
              <span className="text-sm">{st.icon}</span>
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
