import { Eye } from 'lucide-react';
import { Artwork } from '../../types/game';

interface OutlinePreviewProps {
  artwork: Artwork;
  onOpenFullPreview?: () => void;
}

export function OutlinePreview({ artwork, onOpenFullPreview }: OutlinePreviewProps) {
  return (
    <div className="relative aspect-square w-full rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
      {/* SVG Outline with Numbers */}
      <svg
        viewBox={artwork.viewBox || '0 0 500 500'}
        className="w-full h-full p-2"
      >
        {artwork.regions.map((reg) => (
          <g key={reg.id}>
            <path
              d={reg.path}
              fill="#FFFFFF"
              fillRule={reg.fillRule}
              stroke="#334155"
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Number badge */}
            <circle
              cx={reg.labelPos.x}
              cy={reg.labelPos.y}
              r={9}
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth={1}
            />
            <text
              x={reg.labelPos.x}
              y={reg.labelPos.y + 3.5}
              textAnchor="middle"
              fill="#1E293B"
              fontSize="10px"
              fontWeight="bold"
              fontFamily="Fredoka, sans-serif"
            >
              {reg.colorIndex}
            </text>
          </g>
        ))}
      </svg>

      {/* Preview Button */}
      <button
        onClick={onOpenFullPreview}
        className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 font-display font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
      >
        <Eye className="w-3.5 h-3.5 text-indigo-600" />
        <span>Preview</span>
      </button>
    </div>
  );
}
