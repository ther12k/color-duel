import { Swords, Clock, AlertCircle, Play, ChevronLeft, Sparkles, ZoomIn, Palette } from 'lucide-react';
import { Artwork, DuelOpponent, GameMode } from '../../types/game';
import { ArtworkThumbnail } from '../common/ArtworkThumbnail';

interface PreMatchBriefingProps {
  artwork: Artwork;
  rival: DuelOpponent;
  mode: GameMode;
  onStartMatch: () => void;
  onCancel: () => void;
}

export function PreMatchBriefing({
  artwork,
  rival,
  mode,
  onStartMatch,
  onCancel,
}: PreMatchBriefingProps) {
  const isMemory = mode === 'memory-duel';
  const isSolo = mode === 'solo';
  const isStudio = mode === 'studio';
  const isHard = artwork.difficulty === 'Hard';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 p-1 -ml-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5">
            {isSolo ? (
              <Palette className="w-5 h-5 text-purple-600" />
            ) : (
              <Swords className="w-5 h-5 text-indigo-600" />
            )}
            <h3 className="font-display font-black text-slate-800 text-lg">
              {isSolo ? 'Solo Painting Mode' : isStudio ? 'Studio Relax' : 'Match Briefing'}
            </h3>
          </div>
          <div className="w-6" />
        </div>

        {/* Artwork Header Card */}
        <div className="flex items-center gap-3 my-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white">
            <ArtworkThumbnail artwork={artwork} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-slate-900 text-base leading-tight truncate">
              {artwork.title}
            </h4>
            <p className="text-xs text-slate-500 font-sans mt-0.5 truncate">
              {artwork.artist ? `${artwork.artist} · ` : ''}{artwork.regions.length} regions · {artwork.palette.length} colors
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isHard
                    ? 'bg-purple-100 text-purple-800'
                    : artwork.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {artwork.difficulty} Level
              </span>
              <span className="text-[10px] font-medium text-slate-500 truncate">
                {isSolo ? 'Self-Paced' : `vs ${rival.name}`}
              </span>
            </div>
          </div>
        </div>

        {/* Solo Mode & Hard Masterpiece Overview */}
        {isSolo ? (
          <div className="space-y-2 mb-4">
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/80">
              <div className="flex items-center gap-1.5 font-display font-bold text-purple-900 text-xs">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Solo Masterpiece Quest</span>
              </div>
              <p className="text-xs text-purple-900/90 font-sans mt-1 leading-relaxed">
                Color at your own pace without rival competition. Zoom in, pan across the canvas, and locate every numbered box to restore the masterpiece to 100% accuracy.
              </p>
            </div>

            {isHard && (
              <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2">
                <ZoomIn className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 font-sans leading-tight">
                  <strong>Masterpiece Note:</strong> This artwork features the original painting. Several polygon boxes are embedded throughout. Use the on-canvas zoom and pan controls to find every number!
                </p>
              </div>
            )}
          </div>
        ) : !isMemory ? (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">
                Bonus Objectives (Independent Rewards)
              </span>
              <span className="text-[10px] text-amber-600 font-bold">+30 pts each</span>
            </div>

            <div className="space-y-1.5">
              {artwork.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/70"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {obj.iconType === 'lantern'
                        ? '🏮'
                        : obj.iconType === 'bowl'
                        ? '🍜'
                        : obj.iconType === 'awning'
                        ? '🎪'
                        : obj.iconType === 'star'
                        ? '⭐'
                        : '💎'}
                    </span>
                    <div>
                      <div className="font-display font-bold text-xs text-slate-800">
                        {obj.title}
                      </div>
                      <div className="text-[10px] text-amber-800 font-sans">
                        Deadline: {obj.deadlineSeconds}s from start
                      </div>
                    </div>
                  </div>
                  <span className="font-display font-extrabold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    +{obj.bonusPoints}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/80 mb-4">
            <h5 className="font-display font-bold text-purple-900 text-xs flex items-center gap-1">
              <span>🧠</span> Memory Duel Rules
            </h5>
            <p className="text-xs text-purple-800/90 font-sans mt-1 leading-relaxed">
              Study the reference image for 8 seconds. Region numbers will vanish! You have 2 Peeks to briefly refresh your memory. Wrong guesses do not fill the region!
            </p>
          </div>
        )}

        {/* Strategy note for Arena */}
        {!isSolo && !isStudio && (
          <div className="p-2.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-900 font-sans leading-tight">
              <strong>Key Decision:</strong> Will you finish your selected color across the whole canvas, or switch colors early to claim bonus deadlines?
            </p>
          </div>
        )}

        {/* Start button */}
        <button
          type="button"
          id="pre-match-start-btn"
          onClick={onStartMatch}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-amber-950 font-display font-black text-base shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-amber-950" />
          <span>{isSolo ? 'Start Solo Painting' : 'Start Match Now!'}</span>
        </button>
      </div>
    </div>
  );
}
