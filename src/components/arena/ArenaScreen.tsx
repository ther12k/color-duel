import { useState } from 'react';
import { Swords, Shield, Zap } from 'lucide-react';
import { GameMode, UserProfile } from '../../types/game';
import { ModeSelectionCards } from './ModeSelectionCards';
import { RankedLeaderboard } from './RankedLeaderboard';

interface ArenaScreenProps {
  user: UserProfile;
  onSelectMode: (mode: GameMode) => void;
  onQuickMatch: () => void;
}

export function ArenaScreen({ user, onSelectMode, onQuickMatch }: ArenaScreenProps) {
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-24 px-3.5 pt-3 space-y-3.5">
      {/* Top Arena Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-800 leading-tight">
            Battle Arena ⚔️
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Two players. One picture. Who colors smarter?
          </p>
        </div>

        <button
          id="arena-quick-match-btn"
          onClick={onQuickMatch}
          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-display font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Quick Match</span>
        </button>
      </div>

      {/* Arena Mode Selection Cards */}
      <ModeSelectionCards
        onSelectMode={onSelectMode}
        onOpenFriendRoom={() => setRoomModalOpen(true)}
      />

      {/* Ranked Leaderboard */}
      <RankedLeaderboard user={user} />

      {/* Friend Room Code Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3">
            <h3 className="font-display font-black text-slate-800 text-base">
              Enter Room Code
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Enter the room code shared by your friend to join their custom match!
            </p>

            <input
              type="text"
              placeholder="#DUEL-1234"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-indigo-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRoomModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 font-display font-bold text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRoomModalOpen(false);
                  onSelectMode('smart-duel');
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 font-display font-bold text-xs text-white cursor-pointer"
              >
                Join Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
