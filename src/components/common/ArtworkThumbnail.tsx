import { useState } from 'react';
import { Artwork } from '../../types/game';

interface ArtworkThumbnailProps {
  artwork: Artwork;
  className?: string;
  showLineArt?: boolean;
}

export function ArtworkThumbnail({ artwork, className = '', showLineArt = false }: ArtworkThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  // If a custom image thumbnail exists and doesn't fail, we can render it.
  // BUT we also render the pristine vector SVG representation so it's guaranteed to be an authentic coloring-book illustration!
  if (!artwork.thumbnail || hasError || artwork.thumbnail.startsWith('data:image/svg')) {
    return (
      <div className={`relative w-full h-full bg-white overflow-hidden flex items-center justify-center ${className}`}>
        <svg
          viewBox={artwork.viewBox || '0 0 500 500'}
          className="w-full h-full object-cover select-none"
        >
          {/* Paper Background */}
          <rect width="500" height="500" fill="#FAFAFA" />

          {/* Render All Regions */}
          {artwork.regions.map((region) => {
            const paletteItem = artwork.palette.find((p) => p.number === region.colorIndex);
            const fill = showLineArt ? '#FFFFFF' : paletteItem?.hex || '#CBD5E1';
            return (
              <path
                key={region.id}
                d={region.path}
                fill={fill}
                stroke="#18181B"
                strokeWidth={1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <img
      src={artwork.thumbnail}
      alt={artwork.title}
      className={`w-full h-full object-cover select-none ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
