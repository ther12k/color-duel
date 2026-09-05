import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Swords, Share2, Users, Home, RotateCcw, CheckCircle2 } from 'lucide-react';
import { DuelResult, UserProfile } from '../../types/game';
import { MatchStatsTable } from './MatchStatsTable';
import { WhyYouWonCard } from './WhyYouWonCard';
import { RewardsEarnedCard } from './RewardsEarnedCard';

interface ResultsScreenProps {
  result: DuelResult;
  user: UserProfile;
  onRematch: () => void;
  onChallengeFriend: () => void;
  onBackToArena: () => void;
}

export function ResultsScreen({
  result,
  user,
  onRematch,
  onChallengeFriend,
  onBackToArena,
}: ResultsScreenProps) {
  useEffect(() => {
    if (result.isWin) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.35 },
          colors: ['#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#3B82F6'],
        });
      } catch (e) {
        // Safe confetti fallback
      }
    }
  }, [result.isWin]);

  const isWin = result.isWin;
  const isDraw = result.isDraw;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-12 flex flex-col">
      {/* Top Banner Celebration */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#8B5CF6] via-[#6366F1] to-[#4F46E5] text-white pt-6 pb-8 px-4 rounded-b-[36px] shadow-lg flex flex-col items-center text-center">
        {/* Decorative glowing background stars */}
        <div className="absolute top-2 left-4 text-2xl animate-pulse">✨</div>
        <div className="absolute top-8 right-6 text-xl animate-bounce">🎉</div>

        {/* Crown & Title */}
        <div className="text-3xl mb-0.5">👑</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-tight">
          {isDraw ? 'Good Draw!' : isWin ? 'You Win!' : 'Rival Wins!'}
        </h1>
        <p className="text-indigo-100 text-xs font-sans mt-0.5 max-w-[260px]">
          {isWin
            ? 'Great coloring! You outpaced your rival with smarter decisions!'
            : 'Close match! Check the stats below to see where the points were made.'}
        </p>

        {/* VS Score Hero Card */}
        <div className="mt-4 w-full flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          {/* You */}
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-400 shrink-0">
              <img
                src={user.avatar}
                alt="You"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                You
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-indigo-200 font-bold uppercase">You</span>
              <div className="flex items-center gap-1">
                <span className="text-base">🏆</span>
                <span className="font-display font-black text-2xl text-amber-300 leading-none">
                  {result.playerScore}
                </span>
              </div>
            </div>
          </div>

          {/* VS badge */}
          <div className="font-display font-black text-amber-400 text-lg italic px-2">
            VS
          </div>

          {/* Rival */}
          <div className="flex-1 flex items-center justify-end gap-2 text-right">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-indigo-200 font-bold uppercase">
                {result.rivalName}
              </span>
              <span className="font-display font-black text-2xl text-white leading-none">
                {result.rivalScore}
              </span>
            </div>
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-blue-400 to-cyan-400 shrink-0">
              <img
                src={result.rivalAvatar}
                alt={result.rivalName}
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute -bottom-1 -left-1 bg-blue-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                Rival
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="px-3.5 -mt-3 space-y-3 z-10 flex-1">
        {/* Match Stats & Finished Artwork Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Stats table (3 cols on desktop, full width on mobile) */}
          <div className="sm:col-span-3 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Match Stats
            </h4>
            <MatchStatsTable result={result} />
          </div>

          {/* Finished Artwork Preview (2 cols) */}
          <div className="sm:col-span-2 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Finished Artwork
            </h4>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={result.artwork.thumbnail}
                alt={result.artwork.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-emerald-500 text-white font-display font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>100%</span>
              </div>
            </div>
            <span className="font-display font-bold text-slate-700 text-xs truncate mt-2">
              {result.artwork.title}
            </span>
          </div>
        </div>

        {/* Why You Won / Lost Concrete Tactical Explanation */}
        <WhyYouWonCard result={result} />

        {/* Rewards Earned */}
        <RewardsEarnedCard
          coins={result.coinsEarned}
          arenaPoints={result.arenaPointsEarned}
          xp={result.xpEarned}
          user={user}
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Rematch button */}
          <button
            id="results-rematch-btn"
            onClick={onRematch}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-amber-950 font-display font-black text-sm shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Rematch</span>
          </button>

          {/* Share Result button */}
          <button
            id="results-share-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Color Duel Score!',
                  text: `I just scored ${result.playerScore} pts in Color Duel on "${result.artwork.title}"! Can you beat my run?`,
                }).catch(() => {});
              } else {
                alert(`Challenge copied: "Can you beat ${result.playerScore} pts on ${result.artwork.title}?"`);
              }
            }}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-display font-black text-sm shadow-md shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Share Result</span>
          </button>

          {/* Challenge Friend */}
          <button
            id="results-challenge-friend-btn"
            onClick={onChallengeFriend}
            className="py-2.5 px-3 rounded-2xl bg-[#2563EB] text-white font-display font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Challenge Friend</span>
          </button>

          {/* Back to Arena */}
          <button
            id="results-back-arena-btn"
            onClick={onBackToArena}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Arena</span>
          </button>
        </div>
      </div>
    </div>
  );
}
