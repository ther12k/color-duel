import { useState } from 'react';
import { Artwork } from '../../types/game';
import { finishedFillFor, parseViewBox } from '../../lib/paints';
import { ArtworkGradientDefs, ArtworkDetailLines } from './ArtworkPaint';

interface ArtworkThumbnailProps {
  artwork: Artwork;
  className?: string;
  /**
   * Render the finished paint. Default false: thumbnails render pure lineart
   * so choosing an artwork never spoils its colors — the finished look is
   * revealed by playing (results screen, completed shelf).
   */
  finished?: boolean;
}

export function ArtworkThumbnail({ artwork, className = '', finished = false }: ArtworkThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const vb = parseViewBox(artwork.viewBox);

  // Image-based artwork packages: numbered reference until finished, colored master after.
  if (artwork.imageReference && !hasError) {
    return (
      <img
        src={finished ? artwork.imageReference.previewColored : artwork.imageReference.previewNumbered}
        alt={artwork.title}
        className={`w-full h-full object-cover select-none ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  // Colored gallery masters are reveal-only; normal cards stay numbered lineart.
  if (artwork.galleryThumbnailUrl && finished && !hasError) {
    return (
      <img
        src={artwork.galleryThumbnailUrl}
        alt={artwork.title}
        className={`w-full h-full object-cover select-none ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  // Vector packages with a colored master raster: the finished reveal for the
  // results screen and completed shelf. Before that moment only lineart shows.
  if (finished && artwork.finishedPreviewUrl && !hasError) {
    return (
      <img
        src={artwork.finishedPreviewUrl}
        alt={artwork.title}
        className={`w-full h-full object-cover select-none ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  // Package bitmap previews: uncolored numbered lineart while unplayed; the
  // colored master (image packages) only once finished. Vector-rendered
  // thumbnails stay pure lineart until `finished` is requested.
  if (artwork.thumbnail && !hasError && !artwork.thumbnail.startsWith('data:image/svg')) {
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

  return (
    <div className={`relative w-full h-full bg-white overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        viewBox={artwork.viewBox || '0 0 500 500'}
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <ArtworkGradientDefs artwork={artwork} />
        </defs>

        {/* Paper Background */}
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={artwork.backgroundColor || '#FAFAFA'} />

        {/* Render All Regions — white fills for the lineart look, finished
            paint only once explicitly revealed */}
        {artwork.regions.map((region) => {
          const fill = finished ? finishedFillFor(artwork, region.colorIndex) : '#FFFFFF';
          return (
            <path
              key={region.id}
              d={region.path}
              fill={fill}
              fillRule={region.fillRule}
              stroke={artwork.boundaryStroke ?? '#18181B'}
              strokeWidth={artwork.boundaryStrokeWidth ?? 1.8}
              strokeDasharray={
                artwork.boundaryStyle === 'dotted'
                  ? artwork.boundaryDasharray ?? '1.8 2.2'
                  : undefined
              }
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {/* Decorative Detail Linework (stays visible in both states) */}
        <ArtworkDetailLines artwork={artwork} />
      </svg>
    </div>
  );
}
