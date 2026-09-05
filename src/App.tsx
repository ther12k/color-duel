import { useState } from 'react';
import { ARTWORKS } from './data/artworks';
import { INITIAL_RIVALS, INITIAL_USER_PROFILE } from './data/initialState';
import { Artwork, DuelOpponent, DuelResult, GameMode, UserProfile } from './types/game';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { ArtworkPlayModal } from './components/common/ArtworkPlayModal';
import { SettingsModal } from './components/common/SettingsModal';
import { HomeScreen } from './components/home/HomeScreen';
import { GalleryScreen } from './components/gallery/GalleryScreen';
import { ArenaScreen } from './components/arena/ArenaScreen';
import { CreateChallengeScreen } from './components/create/CreateChallengeScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { DuelGameScreen } from './components/duel/DuelGameScreen';
import { ResultsScreen } from './components/results/ResultsScreen';

type ScreenMode = 'main' | 'duel' | 'results';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [screenMode, setScreenMode] = useState<ScreenMode>('main');

  // Core Game State
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [artworks, setArtworks] = useState<Artwork[]>(ARTWORKS);
  const [activeArtwork, setActiveArtwork] = useState<Artwork>(ARTWORKS[0]);
  const [activeMode, setActiveMode] = useState<GameMode>('smart-duel');
  const [activeRival, setActiveRival] = useState<DuelOpponent>(INITIAL_RIVALS[0]);
  const [lastResult, setLastResult] = useState<DuelResult | null>(null);

  // Modals
  const [artworkModalTarget, setArtworkModalTarget] = useState<Artwork | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 1. Launch Game
  const handleStartGame = (artwork: Artwork, mode: GameMode) => {
    setActiveArtwork(artwork);
    setActiveMode(mode);
    // Pick appropriate rival
    const rival = INITIAL_RIVALS[Math.floor(Math.random() * INITIAL_RIVALS.length)];
    setActiveRival({ ...rival, score: 0 });
    setArtworkModalTarget(null);
    setScreenMode('duel');
  };

  // 2. Play Flagship Smart Duel from Hero Banner
  const handlePlaySmartDuel = () => {
    const flagshipArt = artworks.find((a) => a.id === 'cozy-ramen-stall') || artworks[0];
    handleStartGame(flagshipArt, 'smart-duel');
  };

  // 3. Play Daily Challenge
  const handleStartDaily = () => {
    const dailyArt = artworks.find((a) => a.isDaily) || artworks[2];
    handleStartGame(dailyArt, 'smart-duel');
  };

  // 4. Match Finished
  const handleFinishMatch = (result: DuelResult) => {
    setLastResult(result);

    // Update user stats
    setUser((prev) => {
      const nextCoins = prev.coins + result.coinsEarned;
      const nextArena = prev.arenaPoints + result.arenaPointsEarned;
      const nextXP = prev.xp + result.xpEarned;
      let nextLevel = prev.level;
      let nextXPForNext = prev.xpForNextLevel;

      if (nextXP >= nextXPForNext) {
        nextLevel += 1;
        nextXPForNext += 250;
      }

      const nextCompleted = prev.completedArtworkIds.includes(result.artwork.id)
        ? prev.completedArtworkIds
        : [...prev.completedArtworkIds, result.artwork.id];

      return {
        ...prev,
        coins: nextCoins,
        arenaPoints: nextArena,
        xp: nextXP,
        level: nextLevel,
        xpForNextLevel: nextXPForNext,
        matchesPlayed: prev.matchesPlayed + 1,
        matchesWon: result.isWin ? prev.matchesWon + 1 : prev.matchesWon,
        streakDays: result.isWin ? prev.streakDays + 1 : prev.streakDays,
        weeklyGoalCompleted: Math.min(prev.weeklyGoalTotal, prev.weeklyGoalCompleted + 1),
        completedArtworkIds: nextCompleted,
      };
    });

    setScreenMode('results');
  };

  // 5. Rematch
  const handleRematch = () => {
    if (!lastResult) return;
    handleStartGame(lastResult.artwork, activeMode);
  };

  // 6. Navigation Actions
  const handleBackToArena = () => {
    setScreenMode('main');
    setActiveTab('arena');
  };

  const handleClaimFreeCoins = () => {
    setUser((prev) => ({ ...prev, coins: prev.coins + 100 }));
    alert('Claimed 100 bonus coins!');
  };

  const handleResetProgress = () => {
    setUser(INITIAL_USER_PROFILE);
    setSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#E5E9F2] flex justify-center text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md min-h-screen bg-[#F4F6FB] flex flex-col shadow-2xl relative">
        {/* Render depending on Screen Mode */}
        {screenMode === 'duel' ? (
          <DuelGameScreen
            artwork={activeArtwork}
            mode={activeMode}
            user={user}
            rival={activeRival}
            onFinishMatch={handleFinishMatch}
            onExit={() => setScreenMode('main')}
          />
        ) : screenMode === 'results' && lastResult ? (
          <ResultsScreen
            result={lastResult}
            user={user}
            onRematch={handleRematch}
            onChallengeFriend={() => {
              setScreenMode('main');
              setActiveTab('create');
            }}
            onBackToArena={handleBackToArena}
          />
        ) : (
          <>
            {/* Top Common Navigation Header */}
            <Header
              user={user}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenSettings={() => setSettingsOpen(true)}
            />

            {/* Main Tabs Content */}
            <main className="flex-1">
              {activeTab === 'home' && (
                <HomeScreen
                  user={user}
                  artworks={artworks}
                  onPlaySmartDuel={handlePlaySmartDuel}
                  onSelectMode={(mode) => {
                    if (mode === 'studio') {
                      handleStartGame(artworks[1], 'studio');
                    } else if (mode === 'memory-duel') {
                      handleStartGame(artworks[0], 'memory-duel');
                    } else {
                      setActiveTab('arena');
                    }
                  }}
                  onSelectDaily={handleStartDaily}
                  onSelectArtwork={(art) => setArtworkModalTarget(art)}
                  onSeeAllArtworks={() => setActiveTab('gallery')}
                />
              )}

              {activeTab === 'gallery' && (
                <GalleryScreen
                  artworks={artworks}
                  user={user}
                  onSelectArtwork={(art) => setArtworkModalTarget(art)}
                  onStartDaily={handleStartDaily}
                />
              )}

              {activeTab === 'arena' && (
                <ArenaScreen
                  user={user}
                  onSelectMode={(mode) => {
                    const art = artworks[Math.floor(Math.random() * artworks.length)];
                    handleStartGame(art, mode);
                  }}
                  onQuickMatch={handlePlaySmartDuel}
                />
              )}

              {activeTab === 'create' && (
                <CreateChallengeScreen
                  onLaunchChallenge={(artwork, mode) => handleStartGame(artwork, mode)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  user={user}
                  artworks={artworks}
                  onSelectArtwork={(art) => setArtworkModalTarget(art)}
                />
              )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </>
        )}

        {/* Modal: Artwork Play Option Drawer */}
        {artworkModalTarget && (
          <ArtworkPlayModal
            artwork={artworkModalTarget}
            onClose={() => setArtworkModalTarget(null)}
            onStartGame={handleStartGame}
          />
        )}

        {/* Modal: Settings / Store */}
        {settingsOpen && (
          <SettingsModal
            user={user}
            onClose={() => setSettingsOpen(false)}
            onClaimFreeCoins={handleClaimFreeCoins}
            onResetProgress={handleResetProgress}
          />
        )}
      </div>
    </div>
  );
}
