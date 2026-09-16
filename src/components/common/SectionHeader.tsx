import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

/** Consistent section heading with optional trailing action link. */
export function SectionHeader({ title, action, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-1 mb-2.5', className)}>
      <h3 className="font-display font-bold text-slate-800 text-[15px] tracking-tight">{title}</h3>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-500 font-sans cursor-pointer transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
