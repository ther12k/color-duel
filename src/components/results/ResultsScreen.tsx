import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Swords, Share2, Users, Home, RotateCcw, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { DuelResult, UserProfile } from '../../types/game';
import { getProgress } from '../../lib/progressStore';
import { MatchStatsTable } from './MatchStatsTable';
import { WhyYouWonCard } from './WhyYouWonCard';
import { RewardsEarnedCard } from './RewardsEarnedCard';
import { ArtworkThumbnail } from '../common/ArtworkThumbnail';

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
    if (result.isWin || result.mode === 'solo') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.35 },
          colors: ['#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#3B82F6'],
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [result.isWin, result.mode]);

  const isSolo = result.mode === 'solo';
  const isWin = result.isWin;
  const isDraw = result.isDraw;
  const stars = result.starsEarned || (result.playerAccuracy >= 90 ? 3 : result.playerAccuracy >= 75 ? 2 : 1);

  // The finished colored reveal is earned by completing every region (across
  // sessions). An unfinished run — e.g. a solo timeout — leaves the artwork
  // unspoiled: it renders as lineart with its real progress percentage.
  const artworkProgress = getProgress(result.artwork.id, result.artwork.contentVersion);
  const artworkComplete = artworkProgress?.isComplete === true;
  const artworkTotal =
    result.artwork.regions.length || result.artwork.declaredRegionCount || 1;
  const artworkPercent = Math.min(
    100,
    Math.round(((artworkProgress?.completedRegionIds.length ?? 0) / artworkTotal) * 100)
  );

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-12 flex flex-col">
      {/* Top Banner Celebration */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#8B5CF6] via-[#6366F1] to-[#4F46E5] text-white pt-6 pb-8 px-4 rounded-b-[36px] shadow-lg flex flex-col items-center text-center">
        {/* Decorative glowing background stars */}
        <div className="absolute top-2 left-4 text-2xl animate-pulse">✨</div>
        <div className="absolute top-8 right-6 text-xl animate-bounce">🎉</div>

        {isSolo ? (
          <>
            {/* Stars for Solo Mode */}
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-7 h-7 ${
                    s <= stars
                      ? 'fill-amber-300 text-amber-300 drop-shadow-md'
                      : 'text-white/30 fill-white/10'
                  }`}
                />
              ))}
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-tight">
              Masterpiece Restored!
            </h1>
            <p className="text-indigo-100 text-xs font-sans mt-0.5 max-w-[260px]">
              {result.artwork.difficulty === 'Hard'
                ? 'You zoomed, uncovered, and completed every hidden polygon box!'
                : 'Beautiful coloring! You restored all regions with graceful precision.'}
            </p>

            {/* Solo Hero Card */}
            <div className="mt-4 w-full flex items-center justify-around bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <div className="text-center">
                <span className="text-[10px] text-indigo-200 font-bold uppercase block">Accuracy</span>
                <span className="font-display font-black text-xl text-emerald-300">
                  {result.playerAccuracy}%
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] text-indigo-200 font-bold uppercase block">Boxes Filled</span>
                <span className="font-display font-black text-xl text-amber-300">
                  {result.playerCorrect} / {result.artwork.regions.length}
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] text-indigo-200 font-bold uppercase block">Mistakes</span>
                <span className="font-display font-black text-xl text-white">
                  {result.playerMistakes}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Body Content */}
      <div className="px-3.5 -mt-3 space-y-3 z-10 flex-1">
        {/* Match Stats & Finished Artwork Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Stats table */}
          <div className="sm:col-span-3 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              {isSolo ? 'Restoration Details' : 'Match Stats'}
            </h4>
            <MatchStatsTable result={result} />
          </div>

          {/* Finished Artwork Preview */}
          <div className="sm:col-span-2 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              {artworkComplete ? 'Completed Artwork' : 'Artwork Progress'}
            </h4>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {result.artwork.paintingBackground ? (
                <img
                  src={result.artwork.paintingBackground}
                  alt={result.artwork.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Vector artworks render their region geometry: the finished
                   palette paints only once every region is colored, otherwise
                   pure lineart so future sessions stay unspoiled. */
                <ArtworkThumbnail
                  artwork={result.artwork}
                  finished={artworkComplete}
                  className="absolute inset-0"
                />
              )}
              <div
                className={`absolute bottom-2 right-2 text-white font-display font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
                  artworkComplete ? 'bg-emerald-500' : 'bg-slate-700/85'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{artworkPercent}%</span>
              </div>
            </div>
            <span className="font-display font-bold text-slate-700 text-xs truncate mt-2">
              {result.artwork.title}
            </span>
          </div>
        </div>

        {/* Tactical Explanation / Restoration Review */}
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
          {/* Rematch / Play Again button */}
          <button
            type="button"
            id="results-rematch-btn"
            onClick={onRematch}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-amber-950 font-display font-black text-sm shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{isSolo ? 'Play Again' : 'Rematch'}</span>
          </button>

          {/* Share Result button */}
          <button
            type="button"
            id="results-share-btn"
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: 'Color Duel Masterpiece!',
                    text: `I just completed "${result.artwork.title}" with ${result.playerAccuracy}% accuracy in Color Duel!`,
                  })
                  .catch(() => {});
              }
            }}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-display font-black text-sm shadow-md shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Share</span>
          </button>

          {/* Challenge Friend */}
          {!isSolo ? (
            <button
              type="button"
              id="results-challenge-friend-btn"
              onClick={onChallengeFriend}
              className="py-2.5 px-3 rounded-2xl bg-[#2563EB] text-white font-display font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Challenge Friend</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToArena}
              className="py-2.5 px-3 rounded-2xl bg-indigo-600 text-white font-display font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>More Masterpieces</span>
            </button>
          )}

          {/* Back to Home / Gallery */}
          <button
            type="button"
            id="results-back-arena-btn"
            onClick={onBackToArena}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
