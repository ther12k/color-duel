import { useState } from 'react';
import { Images, Calendar, Layers } from 'lucide-react';
import { Artwork, UserProfile } from '../../types/game';
import { TodayChallengeBanner } from './TodayChallengeBanner';
import { StreakGoals } from './StreakGoals';
import { ArtworkGrid } from './ArtworkGrid';

interface GalleryScreenProps {
  artworks: Artwork[];
  user: UserProfile;
  onSelectArtwork: (art: Artwork) => void;
  onStartDaily: () => void;
}

type GalleryTab = 'gallery' | 'collections' | 'daily';

export function GalleryScreen({
  artworks,
  user,
  onSelectArtwork,
  onStartDaily,
}: GalleryScreenProps) {
  const [activeTab, setActiveTab] = useState<GalleryTab>('gallery');
  const [category, setCategory] = useState('All');

  const dailyArt = artworks.find((a) => a.isDaily) || artworks[2];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-24 px-3.5 pt-3 space-y-3.5">
      {/* Top Gallery Navigation Tabs */}
      <div className="flex items-center justify-around bg-white rounded-2xl p-1 border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-1.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Images className="w-3.5 h-3.5" />
          <span>Gallery</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 py-1.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'collections'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Collections</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-1.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily</span>
        </button>
      </div>

      {/* Today's Challenge Hero Banner */}
      <TodayChallengeBanner
        artwork={dailyArt}
        onStartChallenge={onStartDaily}
      />

      {/* Streak & Goals */}
      <StreakGoals user={user} />

      {/* Artwork Grid & Filter */}
      <ArtworkGrid
        artworks={artworks}
        completedIds={user.completedArtworkIds}
        selectedCategory={category}
        onSelectCategory={setCategory}
        onSelectArtwork={onSelectArtwork}
      />
    </div>
  );
}
