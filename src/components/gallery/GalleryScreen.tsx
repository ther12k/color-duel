import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Artwork, UserProfile } from '../../types/game';
import { ArtworkCard } from '../common/ArtworkCard';
import { SectionHeader } from '../common/SectionHeader';
import { cn } from '../../lib/utils';
import { ArtworkFamily, groupArtworkFamilies } from '../../lib/artworkFamilies';

interface GalleryScreenProps {
  artworks: Artwork[];
  user: UserProfile;
  onSelectArtwork: (art: Artwork) => void;
}

const CATEGORIES = [
  'All', 'Cozy', 'Nature', 'Fantasy', 'Characters', 'Masterpiece', 'Travel',
  'Interior', 'Sci-Fi', 'Mandala', 'Coastal', 'Wildlife', 'Animals', 'Ocean',
];
const PAGE_SIZE = 12;

/** Library of every artwork: finished, in-progress, and unexplored. */
export function GalleryScreen({ artworks, user, onSelectArtwork }: GalleryScreenProps) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const families = useMemo(() => groupArtworkFamilies(artworks), [artworks]);
  const normalizedQuery = query.trim().toLowerCase();

  const categories = CATEGORIES.filter(
    (c) => c === 'All' || families.some((family) => family.variants.some((art) => art.category === c))
  );

  const filteredFamilies = useMemo(() => families.filter((family) => {
    const matchesCategory = category === 'All' || family.variants.some((art) => art.category === category);
    const matchesQuery = normalizedQuery === '' || family.variants.some((art) =>
      art.title.toLowerCase().includes(normalizedQuery) ||
      (art.subtitle ?? '').toLowerCase().includes(normalizedQuery)
    );
    return matchesCategory && matchesQuery;
  }), [families, category, normalizedQuery]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, normalizedQuery, families]);

  const visibleFamilies = filteredFamilies.slice(0, visibleCount);
  const hasMore = visibleFamilies.length < filteredFamilies.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || isLoadingMore) return;
      setIsLoadingMore(true);
      window.setTimeout(() => {
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredFamilies.length));
        setIsLoadingMore(false);
      }, 120);
    }, { rootMargin: '240px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredFamilies.length, hasMore, isLoadingMore]);

  const isFamilyCompleted = (family: ArtworkFamily) =>
    family.variants.some((art) => user.completedArtworkIds.includes(art.id));

  return (
    <div className="w-full max-w-md mx-auto bg-[#F6F6F4] pb-24 px-3.5 pt-3 space-y-3">
      <SectionHeader title="Artwork Library" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artworks..."
          aria-label="Search artworks"
          className="w-full pl-9 pr-3 py-2.5 bg-white rounded-2xl border border-slate-200/80 text-[13px] font-sans text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-0.5 px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold font-sans transition-all cursor-pointer border',
              category === c ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >{c}</button>
        ))}
      </div>

      {visibleFamilies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {visibleFamilies.map((family) => (
              <ArtworkCard
                key={family.key}
                artwork={family.representative}
                isCompleted={isFamilyCompleted(family)}
                onClick={() => onSelectArtwork(family.representative)}
              />
            ))}
          </div>
          <div ref={sentinelRef} className="h-8 flex items-center justify-center" aria-live="polite">
            {isLoadingMore ? <span className="text-[11px] text-slate-400">Loading more...</span> : !hasMore ? <span className="text-[11px] text-slate-400">All artworks loaded</span> : null}
          </div>
        </>
      ) : (
        <div className="py-14 text-center">
          <p className="font-display font-bold text-slate-500 text-sm">No artworks found</p>
          <p className="text-[11.5px] text-slate-400 font-sans mt-1">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
