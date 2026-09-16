import { useEffect, useState } from 'react';
import { INITIAL_RIVALS, INITIAL_USER_PROFILE } from './data/initialState';
import { Artwork, DuelOpponent, DuelResult, GameMode, UserProfile } from './types/game';
import { loadArtworkPack, loadArtworkPlayData } from './lib/artworkRepository';
import { recordSession, getProgress } from './lib/progressStore';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { ArtworkPreviewScreen } from './components/common/ArtworkPreviewScreen';
import { SettingsModal } from './components/common/SettingsModal';
import { HomeScreen } from './components/home/HomeScreen';
import { ArenaScreen } from './components/arena/ArenaScreen';
import { GalleryScreen } from './components/gallery/GalleryScreen';
import { DailyScreen } from './components/daily/DailyScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { CreateChallengeScreen } from './components/create/CreateChallengeScreen';
import { DuelGameScreen } from './components/duel/DuelGameScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { DuelLobbyScreen } from './components/duel/DuelLobbyScreen';
import { DuelInvite, decodeDuelInvite, encodeDuelInvite } from './lib/duelInvite';

type ScreenMode = 'main' | 'duel' | 'results' | 'preview' | 'create' | 'daily' | 'lobby';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [screenMode, setScreenMode] = useState<ScreenMode>('main');

  // Core Game State. Artworks come exclusively from the packaged catalog
  // (public/artworks/). Image-reference packages without region data are
  // hidden until their regions are authored — showing them would either spoil
  // the finished art or offer gameplay that can't work.
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode>('solo');
  const [activeRival, setActiveRival] = useState<DuelOpponent>(INITIAL_RIVALS[0]);
  const [lastResult, setLastResult] = useState<DuelResult | null>(null);
  const [packLoadError, setPackLoadError] = useState(false);
  const [duelInvite, setDuelInvite] = useState<DuelInvite | null>(null);
  const [inviteJoined, setInviteJoined] = useState(false);

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get('duel');
    if (encoded) { const invite = decodeDuelInvite(encoded); if (invite) { setDuelInvite(invite); setScreenMode('lobby'); } }
    loadArtworkPack()
      // Image-reference packages (PNG previews, no regions) stay hidden until
      // their regions are authored. Detailed vector stubs are playable — they
      // hydrate lazily when a match starts.
      .then((list) => { const visible = list.filter((a) => !a.imageReference); setArtworks(visible); const encoded = new URLSearchParams(window.location.search).get('duel'); const invite = encoded ? decodeDuelInvite(encoded) : null; const art = invite && visible.find((a) => a.id === invite.artworkId); if (invite && art) { setDuelInvite(invite); setActiveArtwork(art); setActiveMode(invite.mode); } })
      .catch(() => setPackLoadError(true));
  }, []);

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 1. Launch any game. Detailed packages arrive as stubs — fetch their full
  // painting data (regions + underpainting) before entering the game screen.
  const handleStartGame = async (artwork: Artwork, mode: GameMode) => {
    let full = artwork;
    if (artwork.dataUrls && artwork.regions.length === 0) {
      try {
        full = await loadArtworkPlayData(artwork);
        setArtworks((prev) => prev.map((a) => (a.id === full.id ? full : a)));
      } catch (e) {
        console.error('Failed to load artwork data', e);
        alert('Could not load this artwork. Please try again.');
        return;
      }
    }
    setActiveArtwork(full);
    setActiveMode(mode);
    // Pick appropriate rival (only shown in duel modes)
    const rival = INITIAL_RIVALS[Math.floor(Math.random() * INITIAL_RIVALS.length)];
    setActiveRival({ ...rival, score: 0 });
    recordSession(full.id); // powers the Daily month grid
    setScreenMode('duel');
  };

  // Solo is the default everywhere: tapping an artwork plays it immediately,
  // with no mode chooser in the way.
  const handleStartSolo = (artwork: Artwork) => handleStartGame(artwork, 'solo');
  const handleStartStudio = (artwork: Artwork) => handleStartGame(artwork, 'studio');

  // Random playable artwork for one-tap quick modes on the dashboard.
  const pickPlayable = () => {
    const playable = artworks.filter((a) => a.regions.length > 0 || a.dataUrls);
    return playable.length ? playable[Math.floor(Math.random() * playable.length)] : null;
  };

  // 2. Quick Match: instant smart duel on a random playable artwork.
  const handleQuickMatch = () => {
    const art = pickPlayable();
    if (art) handleStartGame(art, 'smart-duel');
  };

  const handleQuickMemoryDuel = () => {
    const art = pickPlayable();
    if (art) handleStartGame(art, 'memory-duel');
  };

  // 3. Play Daily Challenge (a smart duel against the daily rival).
  const handleStartDaily = () => {
    if (artworks.length === 0) return;
    const dailyArt = artworks.find((a) => a.isDaily) ?? artworks[0];
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

      // An artwork joins the completed shelf only once every playable region
      // is actually colored — progressStore dedupes region IDs across sessions,
      // so a timed-out session can never mark an artwork complete.
      const artworkComplete = getProgress(result.artwork.id)?.isComplete === true;
      const nextCompleted = artworkComplete
        ? prev.completedArtworkIds.includes(result.artwork.id)
          ? prev.completedArtworkIds
          : [...prev.completedArtworkIds, result.artwork.id]
        : prev.completedArtworkIds.filter((id) => id !== result.artwork.id);

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
  const handleBackToMain = (tab: NavTab = 'home') => {
    setScreenMode('main');
    setActiveTab(tab);
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
    <div className="min-h-screen bg-[#E9E9E6] flex justify-center text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white lg:p-4">
      <div className="w-full max-w-md lg:max-w-6xl min-h-screen lg:min-h-[calc(100vh-2rem)] bg-[#F6F6F4] flex flex-col shadow-2xl lg:rounded-[2rem] overflow-hidden relative">
        {/* Render depending on Screen Mode */}
        {screenMode === 'lobby' && duelInvite && activeArtwork ? (<DuelLobbyScreen artwork={activeArtwork} invite={duelInvite} joined={inviteJoined} onStart={() => setScreenMode('duel')} onExit={() => handleBackToMain('duel')} />) : screenMode === 'duel' && activeArtwork ? (
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
            onChallengeFriend={() => handleBackToMain('duel')}
            onBackToArena={() => handleBackToMain('duel')}
          />
        ) : screenMode === 'preview' && activeArtwork ? (
          <ArtworkPreviewScreen artwork={activeArtwork} onExit={() => setScreenMode('main')} />
        ) : screenMode === 'create' ? (
          <CreateChallengeScreen
            artworks={artworks}
            onLaunchChallenge={(artwork, mode) => handleStartGame(artwork, mode)}
            onExit={() => handleBackToMain()}
          />
        ) : screenMode === 'daily' ? (
          <DailyScreen
            artworks={artworks}
            streakDays={user.streakDays}
            onStartDaily={handleStartDaily}
            onExit={() => handleBackToMain('home')}
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
                  onPlaySolo={handleStartSolo}
                  onOpenStudio={handleStartStudio}
                  onQuickDuel={handleQuickMatch}
                  onQuickMemoryDuel={handleQuickMemoryDuel}
                  onGoDuel={() => setActiveTab('duel')}
                  onGoGallery={() => setActiveTab('gallery')}
                  onGoDaily={() => setScreenMode('daily')}
                  onGoProfile={() => setActiveTab('profile')}
                />
              )}

              {activeTab === 'duel' && (
                <ArenaScreen
                  user={user}
                  artworks={artworks}
                  onStartDuel={handleStartGame}
                  onQuickMatch={handleQuickMatch}
                  onOpenCreate={() => setScreenMode('create')}
                  onOpenPreview={(art) => {
                    setActiveArtwork(art);
                    setScreenMode('preview');
                  }}
                  onCreateInvite={(art, mode) => { const invite = { id: Math.random().toString(36).slice(2, 8), artworkId: art.id, mode, difficulty: art.difficulty }; setDuelInvite(invite); setActiveArtwork(art); setActiveMode(mode); setInviteJoined(false); window.history.replaceState({}, '', `?duel=${encodeDuelInvite(invite)}`); setScreenMode('lobby'); }}
                />
              )}

              {activeTab === 'gallery' && (
                <GalleryScreen
                  artworks={artworks}
                  user={user}
                  onSelectArtwork={handleStartSolo}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  user={user}
                  artworks={artworks}
                  onSelectArtwork={handleStartSolo}
                />
              )}

              {/* Pack loading failure notice (artworks still playable from the
                  bundled vector catalog) */}
              {packLoadError && (
                <p className="text-center text-[10.5px] text-slate-400 font-sans pb-4">
                  Optional artwork packages failed to load.
                </p>
              )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onCreate={() => setScreenMode('create')} />
          </>
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
