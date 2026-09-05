import { useState } from 'react';
import { Sparkles, Users, ArrowRight, Share2, Check } from 'lucide-react';
import { Artwork, GameMode } from '../../types/game';
import { PromptInput } from './PromptInput';
import { QuickStyles } from './QuickStyles';
import { OutlinePreview } from './OutlinePreview';
import { ModePicker, ChallengeModeType } from './ModePicker';
import { DifficultyPicker, DifficultyType } from './DifficultyPicker';
import { ARTWORKS } from '../../data/artworks';

interface CreateChallengeScreenProps {
  onLaunchChallenge: (artwork: Artwork, mode: GameMode) => void;
}

const SURPRISE_PROMPTS = [
  'A sleepy dragon running a cozy coffee shop with steaming matcha',
  'A cheerful fox wearing a wildflower crown at an afternoon tea stall',
  'A magical kitten sleeping on a crescent moon above ancient castle spires',
  'A golden retriever enjoying sunny sunflower fields by the seaside',
  'A warm ramen noodle shop with glowing paper lanterns at twilight',
];

export function CreateChallengeScreen({ onLaunchChallenge }: CreateChallengeScreenProps) {
  const [prompt, setPrompt] = useState('A sleepy dragon running a cozy coffee shop');
  const [style, setStyle] = useState('cozy');
  const [mode, setMode] = useState<ChallengeModeType>('number');
  const [difficulty, setDifficulty] = useState<DifficultyType>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Select reference artwork (e.g. sleepy dragon cafe)
  const currentPreviewArtwork =
    ARTWORKS.find((a) => a.id === 'sleepy-dragon-cafe') || ARTWORKS[0];

  const handleSurpriseMe = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Determine GameMode from ChallengeModeType
      const targetMode: GameMode =
        mode === 'memory' ? 'memory-duel' : mode === 'free' ? 'studio' : 'smart-duel';
      onLaunchChallenge(currentPreviewArtwork, targetMode);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6FB] pb-24 px-3.5 pt-3 space-y-3.5">
      {/* Title Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-800 leading-tight">
            Create Your Own Challenge <span className="text-amber-500">✨</span>
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Turn your imagination into a color-by-number duel!
          </p>
        </div>

        {/* AI Magic Badge */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-1 rounded-xl shadow-xs shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-[10.5px] leading-tight">AI Magic</span>
            <span className="text-[8px] text-purple-200 leading-none">Ideas & art</span>
          </div>
        </div>
      </div>

      {/* Prompt Input */}
      <PromptInput
        prompt={prompt}
        onChange={setPrompt}
        onSurpriseMe={handleSurpriseMe}
      />

      {/* Grid: Quick Styles + Outline Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <QuickStyles selectedStyle={style} onSelect={setStyle} />
        <div className="space-y-1">
          <span className="font-display font-bold text-slate-800 text-xs">
            Artwork Outline Preview
          </span>
          <OutlinePreview artwork={currentPreviewArtwork} />
        </div>
      </div>

      {/* Challenge Mode Picker */}
      <ModePicker selectedMode={mode} onSelectMode={setMode} />

      {/* Difficulty Settings */}
      <DifficultyPicker
        selectedDifficulty={difficulty}
        onSelectDifficulty={setDifficulty}
      />

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          id="generate-challenge-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] text-white font-display font-black text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{isGenerating ? 'Generating Closed Regions...' : 'Generate Challenge >'}</span>
        </button>

        <button
          id="create-challenge-friend-btn"
          onClick={() => setFriendModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-display font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Challenge a Friend (Send link or code)</span>
        </button>
      </div>

      {/* Friend Challenge Modal */}
      {friendModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3">
            <h3 className="font-display font-black text-slate-800 text-base">
              Invite a Friend to Duel
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Share this locked artwork code. Your friend will receive identical regions and objectives!
            </p>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <span className="font-mono font-bold text-indigo-900 text-sm">
                #DUEL-DRAGON-892
              </span>
              <button
                onClick={() => {
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-xs font-bold text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setFriendModalOpen(false)}
              className="w-full py-2 bg-slate-900 text-white font-display font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
