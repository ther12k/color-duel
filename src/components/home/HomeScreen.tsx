import { Artwork, GameMode, UserProfile } from '../../types/game';
import { HeroBanner } from './HeroBanner';
import { ModeCards } from './ModeCards';
import { DailyRewardBanner } from './DailyRewardBanner';
import { FeaturedArtworks } from './FeaturedArtworks';

interface HomeScreenProps {
  user: UserProfile;
  artworks: Artwork[];
  onPlaySmartDuel: () => void;
  onSelectMode: (mode: GameMode) => void;
  onSelectDaily: () => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onSeeAllArtworks: () => void;
}

export function HomeScreen({
  user,
  artworks,
  onPlaySmartDuel,
  onSelectMode,
  onSelectDaily,
  onSelectArtwork,
  onSeeAllArtworks,
}: HomeScreenProps) {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-24 px-3.5 pt-3 space-y-3.5">
      {/* 1. High Energy Flagship Hero Banner */}
      <HeroBanner onPlaySmartDuel={onPlaySmartDuel} />

      {/* 2. 4 Game Mode Cards */}
      <ModeCards
        onSelectMode={onSelectMode}
        onSelectDaily={onSelectDaily}
      />

      {/* 3. Daily Reward Banner */}
      <DailyRewardBanner onClaim={onSelectDaily} />

      {/* 4. Featured Artworks */}
      <FeaturedArtworks
        artworks={artworks}
        completedIds={user.completedArtworkIds}
        onSelectArtwork={onSelectArtwork}
        onSeeAll={onSeeAllArtworks}
      />
    </div>
  );
}
