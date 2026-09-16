import { useState } from 'react';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import { Artwork } from '../../types/game';
import { ArtworkFamily } from '../../lib/artworkFamilies';
import { hasSeenArtworkExplanation, markArtworkExplanationSeen } from '../../lib/artworkOnboarding';
import { ArtworkThumbnail } from './ArtworkThumbnail';

interface Props { family: ArtworkFamily; onConfirm: (artwork: Artwork) => void; onClose: () => void; }

export function ArtworkLevelPicker({ family, onConfirm, onClose }: Props) {
  const [showIntro, setShowIntro] = useState(() => !hasSeenArtworkExplanation());
  const [selected, setSelected] = useState(family.representative);
  const variants = family.variants;
  const confirm = () => {
    if (showIntro) { markArtworkExplanationSeen(); setShowIntro(false); return; }
    onConfirm(selected);
  };
  return <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-end justify-center p-3" role="dialog" aria-modal="true">
    <div className="w-full max-w-md rounded-3xl bg-[#F6F6F4] p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h2 className="font-display font-black text-lg text-slate-900">{showIntro ? 'How coloring works' : 'Choose a level'}</h2><span className="w-9" />
      </div>
      {showIntro ? <>
        <div className="rounded-2xl bg-white p-4 border border-slate-200 mb-4 flex gap-3"><Palette className="w-7 h-7 text-teal-500 shrink-0" /><div><p className="font-display font-bold text-sm">Color by number</p><p className="text-xs text-slate-500 mt-1">Tap numbered regions and match each number to its palette color. Your progress is saved automatically.</p></div></div>
        <button type="button" onClick={confirm} className="w-full rounded-2xl bg-teal-500 text-white py-3 font-display font-black">Got it — choose a level</button>
      </> : <>
        <div className="flex gap-3 items-center rounded-2xl bg-white p-3 border border-slate-200 mb-3"><div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100"><ArtworkThumbnail artwork={family.representative} className="w-full h-full" /></div><div><p className="font-display font-black text-base">{family.title}</p><p className="text-xs text-slate-500">Same finished artwork · choose detail</p></div></div>
        <div className="grid gap-2">{variants.map((art) => <button key={art.id} type="button" onClick={() => setSelected(art)} className={`p-3 rounded-2xl border flex items-center justify-between ${selected.id === art.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}><span className="text-left"><span className="block font-display font-bold text-sm">{art.difficulty}</span><span className="block text-[11px] text-slate-500">{art.declaredRegionCount ?? art.regions.length} areas · {art.palette.length} colors</span></span>{selected.id === art.id && <Check className="w-4 h-4 text-teal-600" />}</button>)}</div>
        <button type="button" onClick={confirm} className="w-full mt-4 rounded-2xl bg-slate-900 text-white py-3 font-display font-black">Start {selected.difficulty} artwork</button>
      </>}
    </div>
  </div>;
}
