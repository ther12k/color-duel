import { Lightbulb, Crown } from 'lucide-react';
import { DuelResult } from '../../types/game';

interface WhyYouWonCardProps {
  result: DuelResult;
}

export function WhyYouWonCard({ result }: WhyYouWonCardProps) {
  const isWin = result.isWin;
  const isDraw = result.isDraw;

  return (
    <div className="relative overflow-hidden p-3.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/70 rounded-2xl border border-amber-200/80 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-400/30 flex items-center justify-center shrink-0 text-xl shadow-inner">
          💡
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-amber-950 text-sm">
              {isDraw ? 'Result Analysis' : isWin ? 'Why You Won' : 'Match Analysis'}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              <Crown className="w-3 h-3 text-amber-700" />
              <span>{isWin ? 'Strategy Wins!' : 'Skill Building'}</span>
            </div>
          </div>

          <p className="text-xs text-amber-900 font-sans mt-1 leading-relaxed">
            {result.whyExplanation}
          </p>
        </div>
      </div>
    </div>
  );
}
