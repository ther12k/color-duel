import { Sparkles, Dices, X } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onChange: (val: string) => void;
  onSurpriseMe: () => void;
}

export function PromptInput({ prompt, onChange, onSurpriseMe }: PromptInputProps) {
  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <label htmlFor="create-prompt-input" className="font-display font-bold text-slate-800 text-xs">
            Describe your artwork
          </label>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          <span>🤖 Powered by AI</span>
        </div>
      </div>

      <div className="relative">
        <input
          id="create-prompt-input"
          type="text"
          value={prompt}
          maxLength={200}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. A sleepy dragon running a cozy coffee shop"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
        />
        {prompt.length > 0 && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-slate-400 font-sans">
          Be as detailed as you like! Try a scene, character, or mood.
        </span>
        <button
          id="create-surprise-me-btn"
          type="button"
          onClick={onSurpriseMe}
          className="inline-flex items-center gap-1 text-[11px] font-display font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Surprise Me</span>
        </button>
      </div>
    </div>
  );
}
