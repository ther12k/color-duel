import { Artwork } from '../../types/game';
import { paintIdFor, finishedFillFor } from '../../lib/paints';

/**
 * Shared <defs> content: one namespaced linearGradient per palette group that
 * declares stops. Include once inside any SVG that renders artwork finishes.
 */
export function ArtworkGradientDefs({ artwork }: { artwork: Artwork }) {
  return (
    <>
      {artwork.palette
        .filter((p) => p.stops && p.stops.length >= 2)
        .map((p) => (
          <linearGradient key={p.number} id={paintIdFor(artwork.id, p.number)} x1="0" y1="0" x2="1" y2="1">
            {p.stops!.map(([offset, color], i) => (
              <stop key={i} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        ))}
    </>
  );
}

/**
 * Precolored decorative shapes (vector packages): rendered in their finished
 * palette paint in every state. Never tappable, excluded from progress.
 */
export function ArtworkDecorations({ artwork }: { artwork: Artwork }) {
  if (!artwork.decorations?.length) return null;
  return (
    <g pointerEvents="none">
      {artwork.decorations.map((dec) => (
        <path
          key={dec.id}
          d={dec.path}
          fill={finishedFillFor(artwork, dec.colorIndex)}
          fillRule={dec.fillRule}
          stroke="none"
        />
      ))}
    </g>
  );
}

/** Decorative linework layer: above fills, below labels, never tappable. */
export function ArtworkDetailLines({ artwork }: { artwork: Artwork }) {
  if (!artwork.details?.length) return null;
  return (
    <g fill="none" stroke="#28323C" strokeOpacity={0.72} pointerEvents="none">
      {artwork.details.map((d, i) => (
        <path
          key={d.id ?? d.regionId ?? i}
          d={d.path}
          stroke={d.stroke}
          strokeOpacity={d.opacity ?? (d.stroke ? undefined : 0.72)}
          strokeWidth={d.strokeWidth ?? 1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}
