import { ArrowRight, Gift } from 'lucide-react';

interface DailyRewardBannerProps {
  onClaim: () => void;
}

export function DailyRewardBanner({ onClaim }: DailyRewardBannerProps) {
  return (
    <div
      onClick={onClaim}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-3.5 border border-amber-200/80 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
          🎁
        </div>
        <div>
          <h4 className="font-display font-bold text-amber-950 text-sm leading-tight">
            Complete Daily Challenges
          </h4>
          <p className="text-amber-800/80 text-xs font-sans mt-0.5">
            Earn coins, gems, and exclusive palette frames!
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-amber-900">
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </div>
    </div>
  );
}
