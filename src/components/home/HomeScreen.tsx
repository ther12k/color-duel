import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Brain,
  Brush,
  CalendarDays,
  ChevronRight,
  Crown,
  Heart,
  Swords,
} from 'lucide-react';
import { Artwork, UserProfile } from '../../types/game';
import { ArtworkThumbnail } from '../common/ArtworkThumbnail';
import { SectionHeader } from '../common/SectionHeader';
import { cn } from '../../lib/utils';
import { progressMapFor } from '../../lib/progressStore';
import { groupArtworkFamilies } from '../../lib/artworkFamilies';
import { ArtworkLevelPicker } from '../common/ArtworkLevelPicker';
import { ArtworkFamily } from '../../lib/artworkFamilies';

interface HomeScreenProps {
  user: UserProfile;
  artworks: Artwork[];
  /** Tapping any featured artwork starts SOLO immediately — no mode chooser. */
  onPlaySolo: (art: Artwork) => void;
  /** Studio card / hero: relaxed session on the given artwork. */
  onOpenStudio: (art: Artwork) => void;
  onQuickDuel: () => void;
  onQuickMemoryDuel: () => void;
  onGoDuel: () => void;
  onGoGallery: () => void;
  onGoDaily: () => void;
  onGoProfile: () => void;
}

/** Hero carousel slide definition. */
interface HeroSlide {
  key: string;
  eyebrow: string;
  titleA: string;
  titleB: string;
  copy: string;
  cta: string;
  ctaId: string;
  art?: Artwork;
  onClick: () => void;
}

/**
 * Dashboard (default tab): solo-first studio dashboard with a dedicated duel entry.
 */
export function HomeScreen({
  user,
  artworks,
  onPlaySolo,
  onOpenStudio,
  onQuickDuel,
  onQuickMemoryDuel,
  onGoDuel,
  onGoGallery,
  onGoDaily,
  onGoProfile,
}: HomeScreenProps) {
  const progressByArtwork = useMemo(() => progressMapFor(artworks), [artworks, user.matchesPlayed]);
  const families = useMemo(() => groupArtworkFamilies(artworks), [artworks]);
  const [pickerFamily, setPickerFamily] = useState<ArtworkFamily | null>(null);
  const chooseArtwork = (artwork: Artwork) => {
    const family = families.find((candidate) => candidate.key === artwork.id.toLowerCase());
    if (family && family.variants.length > 1) setPickerFamily(family);
    else onPlaySolo(artwork);
  };

  // Resume hint: most recently touched artwork that is started but unfinished.
  const continueArt = useMemo(() => {
    let best: { art: Artwork; percent: number; at: string } | null = null;
    for (const art of artworks) {
      const p = progressByArtwork[art.id];
      if (!p || p.completedRegionIds.length === 0 || p.isComplete) continue;
      const percent = p.totalRegions > 0 ? (p.completedRegionIds.length / p.totalRegions) * 100 : 0;
      if (!best || p.updatedAt > best.at) best = { art, percent, at: p.updatedAt };
    }
    return best;
  }, [artworks, progressByArtwork]);

  const dailyArt = artworks.find((a) => a.isDaily) ?? artworks[0];
  // Featured rail shows distinct pictures — difficulty variants of one theme
  // share a title, so keep only the newest level of each.
  const featured = useMemo(() => families.map((family) => family.representative), [families]);

  // Catalog entries may ship without like counts; derive a stable one from the
  // id so the rail never shows zeros.
  const likeLabel = (art: Artwork) => {
    if (art.likes && art.likes !== '0') return art.likes;
    let h = 0;
    for (let i = 0; i < art.id.length; i++) h = (h * 31 + art.id.charCodeAt(i)) % 997;
    return `${(1.2 + (h % 140) / 10).toFixed(1)}K`;
  };

  const completedCount = user.completedArtworkIds.filter((id) =>
    artworks.some((a) => a.id === id)
  ).length;
  const collectionPercent = artworks.length
    ? Math.round((completedCount / artworks.length) * 100)
    : 0;

  const slides: HeroSlide[] = [
    {
      key: 'solo',
      eyebrow: 'Solo Studio',
      titleA: 'Color.',
      titleB: 'Unwind.',
      copy: 'Choose one artwork and make it yours, at your own pace.',
      cta: continueArt ? `Resume ${continueArt.art.title}` : 'Start coloring',
      ctaId: 'home-hero-solo-btn',
      art: continueArt?.art ?? featured[0] ?? dailyArt,
      onClick: () => {
        const art = continueArt?.art ?? featured[0];
        if (art) chooseArtwork(art);
      },
    },
    {
      key: 'studio',
      eyebrow: 'Solo Studio',
      titleA: 'Color.',
      titleB: 'Unwind.',
      copy: 'No timer, no rival — pure creativity at your own pace.',
      cta: continueArt ? `Resume ${continueArt.art.title}` : 'Open Studio',
      ctaId: 'home-hero-studio-btn',
      art: continueArt?.art ?? featured[1] ?? featured[0] ?? dailyArt,
      onClick: () => {
        const art = continueArt?.art ?? featured[1] ?? featured[0];
        if (art) onOpenStudio(art);
      },
    },
    {
      key: 'daily',
      eyebrow: 'Daily Challenge',
      titleA: 'A new artwork.',
      titleB: 'A new rival.',
      copy: 'Come back every day. Keep the streak alive.',
      cta: "Play Today's Art",
      ctaId: 'home-hero-daily-btn',
      art: dailyArt,
      onClick: onGoDaily,
    },
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex] ?? slides[0];

  // Auto-advance the hero; depending on the index also resets the timer
  // after a manual dot tap.
  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, slides.length]);

  const modeCards = [
    {
      id: 'home-studio-card',
      title: 'Studio',
      copy: continueArt
        ? `Continue ${continueArt.art.title} · ${Math.round(continueArt.percent)}%`
        : 'Color at your pace. Pure creativity.',
      icon: Brush,
      wrap: 'bg-[#E9F2FB] border-[#D8E7F6]',
      iconTone: 'text-[#2F6FD8]',
      onClick: () => {
        const art = continueArt?.art ?? featured[0];
        if (art) onOpenStudio(art);
      },
    },
    {
      id: 'home-arena-card',
      title: 'Arena',
      copy: 'Real players. Real pressure.',
      icon: Swords,
      wrap: 'bg-[#FBF3E1] border-[#F2E4C2]',
      iconTone: 'text-amber-600',
      onClick: onGoDuel,
    },
    {
      id: 'home-memory-card',
      title: 'Memory Duel',
      copy: 'Color. Remember. Outperform.',
      icon: Brain,
      wrap: 'bg-[#E7F5EE] border-[#CFEBDC]',
      iconTone: 'text-emerald-600',
      onClick: onQuickMemoryDuel,
    },
    {
      id: 'home-daily-card',
      title: 'Daily Challenge',
      copy: 'A new artwork. A new rival. Every day.',
      icon: CalendarDays,
      wrap: 'bg-[#EFECFB] border-[#DED7F4]',
      iconTone: 'text-violet-600',
      onClick: onGoDaily,
    },
  ];

  return (
    <>
      {pickerFamily && <ArtworkLevelPicker family={pickerFamily} onClose={() => setPickerFamily(null)} onConfirm={(art) => { setPickerFamily(null); onPlaySolo(art); }} />}
      <div className="w-full max-w-md mx-auto bg-[#F6F6F4] pb-28 px-3.5 pt-1 space-y-4">
      {/* Brand block */}
      <div className="relative flex flex-col items-center pt-1 pb-1">
        <p className="absolute right-0 top-1 text-right text-[8.5px] leading-[1.35] text-slate-400 font-sans font-semibold">
          Same Art.
          <br />
          Different Minds.
        </p>
        <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
        <h1 className="font-display font-black text-[27px] tracking-tight text-slate-900 leading-tight -mt-0.5">
          Color <span className="text-teal-500">Duel</span>
        </h1>
        <p className="text-[8.5px] tracking-[0.3em] text-slate-400 font-sans font-bold">
          COLOR. COMPETE. CONNECT.
        </p>
      </div>

      {/* Hero carousel */}
      {slide.art && (
        <div
          id="home-hero-card"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EDF2F8] via-[#E7EDF6] to-[#F6F6F4] border border-white shadow-sm"
        >
          <div className="flex items-stretch">
            {/* Copy + CTA */}
            <div className="flex-1 min-w-0 p-4 flex flex-col justify-center gap-1.5">
              <span className="text-[9.5px] font-sans font-bold tracking-[0.22em] text-slate-500 uppercase">
                {slide.eyebrow}
              </span>
              <h2 className="font-display font-black text-[23px] leading-[1.05] tracking-tight text-slate-900">
                {slide.titleA}
                <br />
                {slide.titleB}
              </h2>
              <p className="text-[10.5px] text-slate-500 font-sans leading-snug">{slide.copy}</p>
              <button
                id={slide.ctaId}
                type="button"
                onClick={slide.onClick}
                className="mt-1.5 self-start px-4 py-2 rounded-full bg-[#1E2A4A] text-white font-display font-bold text-[11.5px] shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {slide.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Artwork visual: use the same numbered line art on both panels until the picture is completed. */}
            <div className="w-[42%] shrink-0 relative overflow-hidden bg-white">
              <img
                src={slide.art.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                aria-label={`Show ${s.eyebrow}`}
                onClick={() => setSlideIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all cursor-pointer',
                  i === slideIndex ? 'w-4 bg-slate-700' : 'w-1.5 bg-slate-400/50'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mode grid: Studio / Arena / Memory Duel / Daily */}
      <div className="grid grid-cols-2 gap-2.5">
        {modeCards.map((card) => (
          <button
            key={card.id}
            id={card.id}
            type="button"
            onClick={card.onClick}
            className={cn(
              'p-3.5 rounded-3xl border shadow-xs text-left flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer',
              card.wrap
            )}
          >
            <card.icon className={cn('w-7 h-7 shrink-0', card.iconTone)} strokeWidth={2.2} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-1">
                <span className="font-display font-extrabold text-[12.5px] text-slate-900 leading-tight truncate">
                  {card.title}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </span>
              <span className="block text-[9.5px] text-slate-500 font-sans leading-snug mt-0.5 line-clamp-2">
                {card.copy}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Featured artworks — tap = solo play */}
      <section>
        <SectionHeader title="Featured Artworks" action="See All" onAction={onGoGallery} />
        <div className="grid grid-cols-3 gap-2.5">
          {featured.slice(0, 3).map((art) => (
            <button
              key={art.id}
              type="button"
              onClick={() => chooseArtwork(art)}
              className="group text-left cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200/70 shadow-xs">
                <div className="w-full h-full transition-transform duration-300 group-hover:scale-[1.04]">
                  <ArtworkThumbnail artwork={art} className="w-full h-full" />
                </div>
              </div>
              <p className="font-display font-bold text-[12px] text-slate-800 mt-1.5 leading-tight truncate">
                {art.title}
              </p>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-[9px] text-slate-400 font-sans truncate">
                  By {art.artist ?? 'Color Duel'}
                </span>
                <span className="flex items-center gap-0.5 text-[9px] text-slate-400 shrink-0">
                  <Heart className="w-2.5 h-2.5" />
                  {likeLabel(art)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Collection progress */}
      <button
        id="home-collection-card"
        type="button"
        onClick={onGoProfile}
        className="w-full p-4 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3.5 text-left active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(collectionPercent / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display font-black text-[12px] text-slate-800 tabular-nums">
            {collectionPercent}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-[13.5px] text-slate-800">Collection Progress</p>
          <p className="text-[10.5px] text-slate-500 font-sans mt-0.5">
            {completedCount} of {artworks.length} artworks completed
          </p>
        </div>
        <p className="hidden min-[400px]:block text-[9.5px] leading-snug text-slate-400 font-sans border-l border-slate-100 pl-3 w-[92px] shrink-0">
          “More colors.
          <br />
          A brighter you.”
        </p>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>
      </div>
    </>
  );
}
