import { useMemo, useState } from 'react';
import {
  Zap,
  Timer,
  Brain,
  Dices,
  Eye,
  Swords,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { Artwork, GameMode, UserProfile } from '../../types/game';
import { ArtworkCard } from '../common/ArtworkCard';
import { ArtworkThumbnail } from '../common/ArtworkThumbnail';
import { SectionHeader } from '../common/SectionHeader';
import { RankedLeaderboard } from '../arena/RankedLeaderboard';
import { cn } from '../../lib/utils';
import { groupArtworkFamilies, ArtworkFamily } from '../../lib/artworkFamilies';
import { ArtworkLevelPicker } from '../common/ArtworkLevelPicker';

interface ArenaScreenProps {
  user: UserProfile;
  artworks: Artwork[];
  /** Launch a duel with the chosen artwork + mode. */
  onStartDuel: (art: Artwork, mode: GameMode) => void;
  /** Instant smart duel on a random artwork. */
  onQuickMatch: () => void;
  onOpenCreate: () => void;
  onOpenPreview: (art: Artwork) => void;
  onCreateInvite: (art: Artwork, mode: GameMode) => void;
}

const DUEL_MODES: Array<{ id: GameMode; label: string; blurb: string; icon: typeof Zap; tone: string }> = [
  { id: 'smart-duel', label: 'Smart', blurb: 'Objectives + rival AI', icon: Zap, tone: 'bg-indigo-500' },
  { id: 'speed-duel', label: 'Speed', blurb: 'Race to finish first', icon: Timer, tone: 'bg-blue-500' },
  { id: 'memory-duel', label: 'Memory', blurb: 'Numbers hidden', icon: Brain, tone: 'bg-purple-500' },
];

const LEVELS: Array<{ id: Artwork['difficulty']; label: string }> = [
  { id: 'Easy', label: 'Easy' },
  { id: 'Medium', label: 'Normal' },
  { id: 'Hard', label: 'Hard' },
];

/**
 * Duel Arena: the dedicated duel menu. Pick a duel style, then choose any
 * artwork — or roll a random one by difficulty level — and start the match.
 */
export function ArenaScreen({ user, artworks, onStartDuel, onQuickMatch, onOpenCreate, onOpenPreview, onCreateInvite }: ArenaScreenProps) {
  const [mode, setMode] = useState<GameMode>('smart-duel');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerFamily, setPickerFamily] = useState<ArtworkFamily | null>(null);

  const playable = useMemo(
    () => artworks.filter((a) => a.regions.length > 0 || a.dataUrls),
    [artworks]
  );
  const families = useMemo(() => groupArtworkFamilies(playable), [playable]);
  const selected = playable.find((a) => a.id === selectedId) ?? null;
  const chooseArtwork = (family: ArtworkFamily) => {
    if (family.variants.length > 1) setPickerFamily(family);
    else setSelectedId(family.representative.id);
  };

  const pickRandomByLevel = (level: Artwork['difficulty']) => {
    const pool = families.flatMap((family) => family.variants).filter((a) => a.difficulty === level);
    if (pool.length === 0) return;
    setSelectedId(pool[Math.floor(Math.random() * pool.length)].id);
  };

  const pickRandomAny = () => {
    if (families.length === 0) return;
    const family = families[Math.floor(Math.random() * families.length)];
    setSelectedId(family.representative.id);
  };

  const activeMode = DUEL_MODES.find((m) => m.id === mode) ?? DUEL_MODES[0];

  return (
    <>
      {pickerFamily && <ArtworkLevelPicker family={pickerFamily} onClose={() => setPickerFamily(null)} onConfirm={(art) => { setSelectedId(art.id); setPickerFamily(null); }} />}
      <div className="w-full max-w-md mx-auto bg-[#F6F6F4] pb-24 px-3.5 pt-3 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-800 leading-tight">Duel Arena</h1>
            <p className="text-[11.5px] text-slate-500 font-sans mt-0.5">
            Same picture, different minds. Pick an artwork and a rival.
          </p>
        </div>
        <button
          id="arena-quick-match-btn"
          onClick={onQuickMatch}
          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-display font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          Quick Match
        </button>
      </div>

      {/* Step 1 — duel style */}
      <section>
        <SectionHeader title="1 · Duel Style" />
        <div className="grid grid-cols-3 gap-2">
          {DUEL_MODES.map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                id={`arena-mode-${m.id}`}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  'p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.97]',
                  active
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center mb-1.5',
                    active ? 'bg-white/15' : 'bg-slate-100'
                  )}
                >
                  <m.icon className={cn('w-4 h-4', active ? 'text-amber-300' : 'text-slate-500')} />
                </span>
                <p className="font-display font-bold text-[12px] leading-none">{m.label}</p>
                <p className={cn('text-[9.5px] font-sans mt-1 leading-tight', active ? 'text-slate-300' : 'text-slate-400')}>
                  {m.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2 — random by artwork difficulty */}
      <section>
        <SectionHeader title="2 · Random by Level" />
        <div className="grid grid-cols-4 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              id={`arena-random-${l.id.toLowerCase()}`}
              type="button"
              onClick={() => pickRandomByLevel(l.id)}
              className="py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer hover:border-indigo-300"
            >
              <Dices className="w-4 h-4 text-indigo-500" />
              <span className="font-display font-bold text-[11px] text-slate-700">{l.label}</span>
            </button>
          ))}
          <button
            id="arena-random-any"
            type="button"
            onClick={pickRandomAny}
            className="py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer hover:border-indigo-400"
          >
            <Dices className="w-4 h-4 text-indigo-600" />
            <span className="font-display font-bold text-[11px] text-indigo-700">Any</span>
          </button>
        </div>
      </section>

      {/* Step 3 — pick the artwork */}
      <section>
        <SectionHeader title="3 · Choose Artwork" />
        <div className="grid grid-cols-2 gap-3">
          {families.map((family) => {
            const art = family.representative;
            const isSelected = family.variants.some((variant) => variant.id === selectedId);
            return (
              <div key={art.id} className="relative">
                <ArtworkCard
                  artwork={art}
                  onClick={() => { if (isSelected) setSelectedId(null); else chooseArtwork(family); }}
                  className={cn(
                    'w-full',
                    isSelected && 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#F6F6F4]'
                  )}
                />
                {isSelected && (
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white rounded-full p-1 shadow-md border-2 border-white/70 z-10">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected summary + launch */}
      <div className="sticky bottom-20 z-30">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-lg p-3 flex items-center gap-3">
          {selected ? (
            <>
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <ArtworkThumbnail artwork={selected} className="w-full h-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-[12.5px] text-slate-800 leading-tight truncate">
                  {selected.title}
                </p>
                <p className="text-[10.5px] text-slate-500 font-sans mt-0.5">
                  {selected.difficulty} · {selected.palette.length} colors · vs {activeMode.label} rival
                </p>
              </div>
              <button
                id="arena-preview-btn"
                type="button"
                onClick={() => onOpenPreview(selected)}
                title="Preview lineart"
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0"
              >
                <Eye className="w-4 h-4 text-slate-600" />
              </button>
              <button type="button" onClick={() => onCreateInvite(selected, mode)} className="px-3 py-2.5 rounded-2xl bg-teal-50 text-teal-700 font-display font-bold text-[11px] cursor-pointer">Invite</button>
              <button
                id="arena-start-duel-btn"
                type="button"
                onClick={() => onStartDuel(selected, mode)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-display font-black text-[12.5px] shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Swords className="w-4 h-4" />
                Duel
              </button>
            </>
          ) : (
            <p className="text-[11.5px] text-slate-400 font-sans text-center w-full py-1.5">
              Tap an artwork above — or roll the dice — to set up your duel.
            </p>
          )}
        </div>
      </div>

      {/* AI challenge creation */}
      <section>
        <button
          type="button"
          onClick={onOpenCreate}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] text-white shadow-md shadow-purple-500/25 active:scale-[0.99] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm">Create an AI Challenge</p>
              <p className="text-[11px] text-purple-100 font-sans mt-0.5 leading-snug">
                Describe any scene and duel on it.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-200 shrink-0" />
          </div>
        </button>
      </section>

      {/* Leaderboard */}
      <section>
        <SectionHeader title="Ranked Leaders" />
        <RankedLeaderboard user={user} />
      </section>
      </div>
    </>
  );
}
