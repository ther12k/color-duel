import { useState, useEffect, useRef, MouseEvent } from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  Artwork,
  ArtworkRegion,
  BonusObjective,
  DuelOpponent,
  DuelResult,
  GameMode,
  LiveDuelToast,
  UserProfile,
} from '../../types/game';
import { DuelHUD } from './DuelHUD';
import { BonusObjectivesBar } from './BonusObjectivesBar';
import { ColoringCanvas } from './ColoringCanvas';
import { AreaProgressBar } from './AreaProgressBar';
import { PaletteBar } from './PaletteBar';
import { LiveEventToast } from './LiveEventToast';
import { PeekModal } from './PeekModal';
import { PreMatchBriefing } from './PreMatchBriefing';

interface DuelGameScreenProps {
  artwork: Artwork;
  mode: GameMode;
  user: UserProfile;
  rival: DuelOpponent;
  onFinishMatch: (result: DuelResult) => void;
  onExit: () => void;
}

const MATCH_DURATION = 120; // 2 minutes

export function DuelGameScreen({
  artwork,
  mode,
  user,
  rival: initialRival,
  onFinishMatch,
  onExit,
}: DuelGameScreenProps) {
  // Pre-match state
  const [hasStarted, setHasStarted] = useState(false);

  // Gameplay state
  const [selectedColorIndex, setSelectedColorIndex] = useState(1);
  const [filledRegionIds, setFilledRegionIds] = useState<string[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerMistakes, setPlayerMistakes] = useState(0);
  const [playerBonuses, setPlayerBonuses] = useState(0);
  const [completedObjectiveIds, setCompletedObjectiveIds] = useState<string[]>([]);
  const [objectiveProgress, setObjectiveProgress] = useState<Record<string, number>>({});

  // Rival state
  const [rival, setRival] = useState<DuelOpponent>({ ...initialRival });
  const [rivalFilledIds, setRivalFilledIds] = useState<string[]>([]);
  const [rivalBonuses, setRivalBonuses] = useState(0);

  // Time & feedback
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveToast, setLiveToast] = useState<LiveDuelToast | null>(null);

  // Controls & boosts
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintActiveForColor, setHintActiveForColor] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Memory mode state
  const [peeksLeft, setPeeksLeft] = useState(2);
  const [isPeeking, setIsPeeking] = useState(mode === 'memory-duel');
  const [peekTimer, setPeekTimer] = useState(mode === 'memory-duel' ? 6 : 0);

  // Visual tap feedback
  const [wrongClickPos, setWrongClickPos] = useState<{ x: number; y: number } | null>(null);
  const [correctClickPos, setCorrectClickPos] = useState<{ x: number; y: number } | null>(null);

  const isGameOverRef = useRef(false);

  // 1. Initial Memory Mode Peek countdown
  useEffect(() => {
    if (!hasStarted) return;
    if (mode === 'memory-duel' && isPeeking && peekTimer > 0) {
      const timer = setTimeout(() => {
        setPeekTimer((prev) => {
          if (prev <= 1) {
            setIsPeeking(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, mode, isPeeking, peekTimer]);

  // 2. Main Game Timer
  useEffect(() => {
    if (!hasStarted) return;
    if (isGameOverRef.current) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted]);

  // 3. Rival Simulation AI
  useEffect(() => {
    if (!hasStarted) return;
    if (isGameOverRef.current) return;
    if (mode === 'studio' || mode === 'solo') return;

    // Determine interval speed based on rival speed factor
    const fillIntervalMs = Math.round(1800 / rival.speedFactor);

    const rivalInterval = setInterval(() => {
      setRivalFilledIds((prevRivalFilled) => {
        const remaining = artwork.regions.filter((r) => !prevRivalFilled.includes(r.id));
        if (remaining.length === 0) {
          clearInterval(rivalInterval);
          return prevRivalFilled;
        }

        // Rival picks an unfilled region
        const randomRegion = remaining[Math.floor(Math.random() * remaining.length)];
        const nextFilled = [...prevRivalFilled, randomRegion.id];

        // Rival scores +10
        setRival((r) => ({ ...r, score: r.score + 10 }));

        // Check if rival completed an objective
        artwork.objectives.forEach((obj) => {
          const matchingRegions = artwork.regions.filter(
            (r) => r.objectId === obj.objectId || (obj.regionIds && obj.regionIds.includes(r.id))
          );
          const matchingFilled = nextFilled.filter((id) =>
            matchingRegions.some((r) => r.id === id)
          );
          if (
            matchingFilled.length >= obj.totalRegions &&
            elapsedSeconds <= obj.deadlineSeconds &&
            !obj.isCompletedByRival
          ) {
            obj.isCompletedByRival = true;
            setRivalBonuses((b) => b + 1);
            setRival((r) => ({ ...r, score: r.score + 30 }));
            showToast(`Rival completed ${obj.title}! 🎉`, rival.avatar);
          }
        });

        // 50% rival progress toast
        if (nextFilled.length === Math.floor(artwork.regions.length / 2)) {
          showToast(`Rival filled 50% of the art! ⚡`, rival.avatar);
        }

        // If rival completes all regions
        if (nextFilled.length === artwork.regions.length) {
          setTimeout(() => handleGameOver(), 500);
        }

        return nextFilled;
      });
    }, fillIntervalMs);

    return () => clearInterval(rivalInterval);
  }, [hasStarted, elapsedSeconds, rival.speedFactor, artwork]);

  // Trigger brief floating toast
  const showToast = (message: string, avatar: string) => {
    setLiveToast({ id: Date.now().toString(), message, avatar });
    setTimeout(() => {
      setLiveToast((current) => (current?.message === message ? null : current));
    }, 3000);
  };

  // 4. Region Click Handler
  const handleRegionClick = (region: ArtworkRegion, e: MouseEvent) => {
    if (isGameOverRef.current) return;
    if (filledRegionIds.includes(region.id)) return; // Already filled

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if player selected the correct color!
    if (region.colorIndex === selectedColorIndex) {
      // CORRECT GUESS
      const nextFilled = [...filledRegionIds, region.id];
      setFilledRegionIds(nextFilled);
      setPlayerScore((prev) => prev + 10);

      // Trigger positive visual feedback
      setCorrectClickPos({ x: 200, y: 200 });
      setTimeout(() => setCorrectClickPos(null), 700);

      // Update objective progress
      const nextObjProgress = { ...objectiveProgress };
      let newBonuses = 0;

      artwork.objectives.forEach((obj) => {
        const isMatch =
          obj.objectId === region.objectId || (obj.regionIds && obj.regionIds.includes(region.id));
        if (isMatch) {
          const currentCount = (nextObjProgress[obj.id] || 0) + 1;
          nextObjProgress[obj.id] = currentCount;

          // Check if objective completed before deadline!
          if (
            currentCount >= obj.totalRegions &&
            !completedObjectiveIds.includes(obj.id)
          ) {
            if (elapsedSeconds <= obj.deadlineSeconds) {
              // Award +30 points bonus!
              setCompletedObjectiveIds((prev) => [...prev, obj.id]);
              newBonuses += 1;
              setPlayerScore((score) => score + 30);
              showToast(`Bonus! Completed ${obj.title}! +30 pts 🌟`, user.avatar);
            } else {
              showToast(`Completed ${obj.title} (after deadline)`, user.avatar);
            }
          }
        }
      });

      setObjectiveProgress(nextObjProgress);
      if (newBonuses > 0) {
        setPlayerBonuses((b) => b + newBonuses);
      }

      // Check if user finished the whole artwork!
      if (nextFilled.length === artwork.regions.length) {
        setTimeout(() => handleGameOver(nextFilled.length, playerMistakes, playerBonuses + newBonuses), 600);
      }
    } else {
      // WRONG COLOR
      // Formula: -5 wrong-color attempts. Do not fill the region!
      setPlayerMistakes((m) => m + 1);
      setPlayerScore((s) => Math.max(0, s - 5));

      // Visual negative indicator
      setWrongClickPos({ x: 200, y: 200 });
      setTimeout(() => setWrongClickPos(null), 800);
    }
  };

  // 5. Game Over Handler
  const handleGameOver = (
    finalPlayerCorrect = filledRegionIds.length,
    finalMistakes = playerMistakes,
    finalBonuses = playerBonuses
  ) => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;

    const totalPlayerClicks = finalPlayerCorrect + finalMistakes;
    const playerAccuracy =
      totalPlayerClicks > 0 ? Math.round((finalPlayerCorrect / totalPlayerClicks) * 100) : 100;

    const rivalAccuracy = 95;
    const rivalTotalCorrect = rivalFilledIds.length;

    // Calculate final scores
    const finalPlayerScore =
      finalPlayerCorrect * 10 + finalBonuses * 30 - finalMistakes * 5;
    const finalRivalScore = rival.score;

    const isWin = mode === 'solo' ? true : finalPlayerScore > finalRivalScore;
    const isDraw = mode === 'solo' ? false : finalPlayerScore === finalRivalScore;
    const starsEarned = playerAccuracy >= 90 ? 3 : playerAccuracy >= 75 ? 2 : 1;

    // Generate concrete tactical explanation matching user requirement:
    let whyExplanation = '';
    if (mode === 'solo') {
      whyExplanation = `Masterpiece restored! You discovered and restored all ${finalPlayerCorrect} polygon boxes with ${playerAccuracy}% accuracy!`;
    } else if (isWin) {
      if (finalPlayerCorrect < rivalTotalCorrect && finalBonuses > rivalBonuses) {
        whyExplanation = `You filled fewer regions (${finalPlayerCorrect} vs ${rivalTotalCorrect}), but earned ${finalBonuses} deadline bonus objectives, which gave you the edge!`;
      } else if (finalMistakes < rival.mistakes) {
        whyExplanation = `Your superior accuracy (${finalMistakes} mistakes vs Rival's ${rival.mistakes}) prevented point loss and secured the victory!`;
      } else {
        whyExplanation = `Fast execution and completing ${finalBonuses} bonus objectives on time won you the match!`;
      }
    } else if (isDraw) {
      whyExplanation = `Both players matched evenly across region speed and objective deadlines!`;
    } else {
      if (finalBonuses < rivalBonuses) {
        whyExplanation = `Your rival earned ${rivalBonuses} deadline bonus objectives (+${rivalBonuses * 30} pts). Prioritizing bonus targets will turn the tide!`;
      } else if (finalMistakes > 2) {
        whyExplanation = `${finalMistakes} wrong-color attempts cost you ${finalMistakes * 5} pts. Slowing down to confirm colors prevents costly mistakes!`;
      } else {
        whyExplanation = `Your rival had slightly faster region completion. Try focusing on high-volume colors first!`;
      }
    }

    const result: DuelResult = {
      artwork,
      mode,
      isWin,
      isDraw,
      playerScore: Math.max(0, finalPlayerScore),
      rivalScore: finalRivalScore,
      playerCorrect: finalPlayerCorrect,
      rivalCorrect: rivalTotalCorrect,
      playerBonuses: finalBonuses,
      rivalBonuses: rivalBonuses,
      playerMistakes: finalMistakes,
      rivalMistakes: rival.mistakes,
      playerAccuracy,
      rivalAccuracy,
      playerTimeSeconds: elapsedSeconds,
      rivalTimeSeconds: Math.min(MATCH_DURATION, elapsedSeconds + 15),
      whyExplanation,
      coinsEarned: isWin ? 50 : 20,
      arenaPointsEarned: isWin ? 15 : 5,
      xpEarned: isWin ? 80 : 35,
      rivalName: rival.name,
      rivalAvatar: rival.avatar,
      starsEarned,
    };

    onFinishMatch(result);
  };

  // 6. Action Boosts: Hint & Zoom
  const handleUseHint = () => {
    if (hintsLeft <= 0) return;
    setHintsLeft((h) => h - 1);
    setHintActiveForColor(selectedColorIndex);
    setTimeout(() => {
      setHintActiveForColor(null);
    }, 2500);
  };

  const handleToggleZoom = () => {
    setZoomLevel((z) => (z >= 2.5 ? 1 : z === 1 ? 1.8 : 2.8));
  };

  // 7. Memory Duel Peek
  const handleTriggerPeek = () => {
    if (peeksLeft <= 0 || isPeeking) return;
    setPeeksLeft((p) => p - 1);
    setIsPeeking(true);
    setPeekTimer(4);
  };

  // Remaining counts per color for PaletteBar
  const remainingCountByColor: Record<number, number> = {};
  artwork.palette.forEach((p) => {
    const totalWithColor = artwork.regions.filter((r) => r.colorIndex === p.number).length;
    const filledWithColor = artwork.regions.filter(
      (r) => r.colorIndex === p.number && filledRegionIds.includes(r.id)
    ).length;
    remainingCountByColor[p.number] = Math.max(0, totalWithColor - filledWithColor);
  });

  const playerPercent = Math.round(
    (filledRegionIds.length / Math.max(1, artwork.regions.length)) * 100
  );
  const rivalPercent = Math.round(
    (rivalFilledIds.length / Math.max(1, artwork.regions.length)) * 100
  );

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] flex flex-col justify-between select-none">
      {/* Pre-Match Briefing Modal */}
      {!hasStarted && (
        <PreMatchBriefing
          artwork={artwork}
          rival={rival}
          mode={mode}
          onStartMatch={() => setHasStarted(true)}
          onCancel={onExit}
        />
      )}

      {/* Top Duel HUD (Scores, Timer, Avatars) */}
      <div className="w-full shrink-0">
        <DuelHUD
          user={user}
          rival={rival}
          playerScore={playerScore}
          timeLeft={timeLeft}
          totalTime={MATCH_DURATION}
          mode={mode}
          filledCount={filledRegionIds.length}
          totalCount={artwork.regions.length}
          accuracy={
            filledRegionIds.length + playerMistakes > 0
              ? Math.round(
                  (filledRegionIds.length / (filledRegionIds.length + playerMistakes)) * 100
                )
              : 100
          }
          onExit={onExit}
        />

        {/* Bonus Objectives with Timed Deadlines */}
        {mode !== 'studio' && mode !== 'solo' && (
          <BonusObjectivesBar
            objectives={artwork.objectives}
            completedObjectiveIds={completedObjectiveIds}
            objectiveProgress={objectiveProgress}
            elapsedSeconds={elapsedSeconds}
          />
        )}

        {/* Area Progress duel indicator */}
        {mode !== 'studio' && mode !== 'solo' ? (
          <AreaProgressBar
            user={user}
            rival={rival}
            playerPercent={playerPercent}
            rivalPercent={rivalPercent}
          />
        ) : (
          <div className="px-3.5 py-1.5 bg-white/90 border-b border-slate-100 flex items-center justify-between shadow-2xs">
            <span className="text-xs font-display font-bold text-slate-700">
              Masterpiece Restoration
            </span>
            <div className="flex items-center gap-2">
              <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${playerPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-purple-700">{playerPercent}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Center Canvas Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2.5 overflow-hidden">
        {/* Floating Live Rival Event Toast */}
        {mode !== 'solo' && <LiveEventToast toast={liveToast} />}

        {/* Memory Mode Peek Control */}
        {mode === 'memory-duel' && (
          <PeekModal
            artwork={artwork}
            peeksLeft={peeksLeft}
            isPeeking={isPeeking}
            peekTimer={peekTimer}
            onTriggerPeek={handleTriggerPeek}
          />
        )}

        {/* Interactive Coloring SVG Canvas */}
        <ColoringCanvas
          artwork={artwork}
          filledRegionIds={filledRegionIds}
          selectedColorIndex={selectedColorIndex}
          mode={mode}
          isPeeking={isPeeking}
          hintActiveForColor={hintActiveForColor}
          wrongClickPos={wrongClickPos}
          correctClickPos={correctClickPos}
          zoomLevel={zoomLevel}
          onRegionClick={handleRegionClick}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* Bottom Palette & Controls */}
      <div className="w-full shrink-0">
        <PaletteBar
          palette={artwork.palette}
          selectedColorIndex={selectedColorIndex}
          remainingCountByColor={remainingCountByColor}
          hintsLeft={hintsLeft}
          zoomLevel={zoomLevel}
          onSelectColor={(idx) => setSelectedColorIndex(idx)}
          onUseHint={handleUseHint}
          onToggleZoom={handleToggleZoom}
        />
      </div>
    </div>
  );
}
