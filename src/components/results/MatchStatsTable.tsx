import { DuelResult } from '../../types/game';

interface MatchStatsTableProps {
  result: DuelResult;
}

export function MatchStatsTable({ result }: MatchStatsTableProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between">
      <div className="grid grid-cols-3 text-center text-xs font-display font-bold pb-2 border-b border-slate-200/70">
        <span className="text-left text-slate-500">Stat</span>
        <span className="text-indigo-600 bg-indigo-50 py-0.5 rounded-md">You</span>
        <span className="text-blue-600 bg-blue-50 py-0.5 rounded-md">Rival</span>
      </div>

      <div className="divide-y divide-slate-200/50 text-xs font-sans">
        {/* Correct Regions */}
        <div className="grid grid-cols-3 items-center py-2 text-center">
          <div className="flex items-center gap-1.5 text-left text-slate-700 font-medium">
            <span>🎨</span>
            <span>Correct Regions</span>
          </div>
          <span className="font-display font-bold text-slate-800">
            {result.playerCorrect}
          </span>
          <span className="font-display font-bold text-slate-600">
            {result.rivalCorrect}
          </span>
        </div>

        {/* Bonus Objectives */}
        <div className="grid grid-cols-3 items-center py-2 text-center">
          <div className="flex items-center gap-1.5 text-left text-slate-700 font-medium">
            <span>⭐</span>
            <span>Bonus Objectives</span>
          </div>
          <span className="font-display font-extrabold text-amber-600">
            {result.playerBonuses}
          </span>
          <span className="font-display font-bold text-slate-600">
            {result.rivalBonuses}
          </span>
        </div>

        {/* Mistakes */}
        <div className="grid grid-cols-3 items-center py-2 text-center">
          <div className="flex items-center gap-1.5 text-left text-slate-700 font-medium">
            <span>❌</span>
            <span>Mistakes</span>
          </div>
          <span className="font-display font-bold text-slate-700">
            {result.playerMistakes}
          </span>
          <span className="font-display font-bold text-rose-500">
            {result.rivalMistakes}
          </span>
        </div>

        {/* Accuracy */}
        <div className="grid grid-cols-3 items-center py-2 text-center">
          <div className="flex items-center gap-1.5 text-left text-slate-700 font-medium">
            <span>🎯</span>
            <span>Accuracy</span>
          </div>
          <span className="font-display font-bold text-emerald-600">
            {result.playerAccuracy}%
          </span>
          <span className="font-display font-bold text-slate-600">
            {result.rivalAccuracy}%
          </span>
        </div>

        {/* Completion Time */}
        <div className="grid grid-cols-3 items-center py-2 text-center">
          <div className="flex items-center gap-1.5 text-left text-slate-700 font-medium">
            <span>⏱️</span>
            <span>Time</span>
          </div>
          <span className="font-display font-bold text-indigo-700">
            {formatTime(result.playerTimeSeconds)}
          </span>
          <span className="font-display font-bold text-slate-600">
            {formatTime(result.rivalTimeSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
