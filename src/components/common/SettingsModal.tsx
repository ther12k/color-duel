import { X, Volume2, Bell, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { UserProfile } from '../../types/game';

interface SettingsModalProps {
  user: UserProfile;
  onClose: () => void;
  onClaimFreeCoins: () => void;
  onResetProgress: () => void;
}

export function SettingsModal({
  user,
  onClose,
  onClaimFreeCoins,
  onResetProgress,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-display font-black text-slate-800 text-base">
            Settings & Store
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Daily Coins Booster */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <div>
              <div className="font-display font-bold text-xs text-amber-950">
                Daily Bonus
              </div>
              <div className="text-[10px] text-amber-800 font-sans">
                Claim 100 Free Coins
              </div>
            </div>
          </div>
          <button
            onClick={onClaimFreeCoins}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-xs rounded-xl shadow-xs active:scale-95 cursor-pointer"
          >
            Claim
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2 text-xs font-sans text-slate-700">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span>Sound Effects</span>
            </div>
            <span className="text-emerald-600 font-bold">ON</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Color Splash VFX</span>
            </div>
            <span className="text-emerald-600 font-bold">ON</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Fair Duel Matchmaking</span>
            </div>
            <span className="text-blue-600 font-bold">Active</span>
          </div>
        </div>

        {/* Reset progress button */}
        <button
          onClick={onResetProgress}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-display font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Saved Matches</span>
        </button>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 text-white font-display font-bold text-xs rounded-xl cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
