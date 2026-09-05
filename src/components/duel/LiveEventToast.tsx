import { LiveDuelToast } from '../../types/game';

interface LiveEventToastProps {
  toast: LiveDuelToast | null;
}

export function LiveEventToast({ toast }: LiveEventToastProps) {
  if (!toast) return null;

  return (
    <div className="absolute top-2.5 right-3 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white pl-1.5 pr-3 py-1 rounded-full shadow-lg shadow-indigo-500/30 border border-white/30 backdrop-blur-md">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white shrink-0">
          <img src={toast.avatar} alt="Rival" className="w-full h-full object-cover" />
        </div>
        <span className="font-display font-bold text-xs leading-tight drop-shadow-xs">
          {toast.message}
        </span>
      </div>
    </div>
  );
}
