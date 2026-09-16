import { Copy, Link2, Radio, Swords } from 'lucide-react';
import { Artwork } from '../../types/game';
import { DuelInvite, inviteUrl } from '../../lib/duelInvite';
import { ArtworkThumbnail } from '../common/ArtworkThumbnail';

interface Props { artwork: Artwork; invite: DuelInvite; joined: boolean; onStart: () => void; onExit: () => void; }
export function DuelLobbyScreen({ artwork, invite, joined, onStart, onExit }: Props) {
  const link = inviteUrl(invite);
  const copy = async () => { try { await navigator.clipboard.writeText(link); } catch { window.prompt('Copy invite link', link); } };
  return <div className="min-h-screen bg-[#F6F6F4] p-4 flex flex-col"><button onClick={onExit} className="self-start text-sm text-slate-500">← Back</button><div className="flex-1 flex flex-col justify-center items-center text-center"><div className="w-48 h-48 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm"><ArtworkThumbnail artwork={artwork} className="w-full h-full" /></div><p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-teal-600 font-bold">Local browser demo</p><h1 className="font-display font-black text-2xl mt-1">{joined ? 'Opponent joined!' : 'Invite a friend'}</h1><p className="text-sm text-slate-500 mt-2">{artwork.title} · {invite.difficulty} · {invite.mode}</p>{!joined ? <><button onClick={copy} className="mt-6 px-5 py-3 rounded-2xl bg-white border border-slate-200 font-display font-bold flex items-center gap-2"><Copy className="w-4 h-4" /> Copy invite link</button><div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Radio className="w-4 h-4 animate-pulse" /> Waiting for a second tab to join</div></> : <button onClick={onStart} className="mt-6 px-6 py-3 rounded-2xl bg-slate-900 text-white font-display font-black flex items-center gap-2"><Swords className="w-4 h-4" /> Start duel</button>}</div><div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1"><Link2 className="w-3 h-3" /> Invite sync is local to this browser</div></div>;
}
