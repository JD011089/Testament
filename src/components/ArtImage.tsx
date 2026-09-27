import React from 'react';

interface ArtImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
}

function artBase(src: string): string {
  return src
    .replace(/^\/images\//, '')
    .replace(/\.(jpg|jpeg|webp|avif)$/i, '')
    .replace(/-(768|1376)$/, '');
}

export const ArtImage: React.FC<ArtImageProps> = ({
  src,
  alt,
  className = '',
  width = 1376,
  height = 768,
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  const base = artBase(src);
  const sizes = '(max-width: 768px) 100vw, 768px';

  return (
    <picture className="contents">
      <source
        type="image/avif"
        srcSet={`/images/${base}-768.avif 768w, /images/${base}-1376.avif 1376w`}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={`/images/${base}-768.webp 768w, /images/${base}-1376.webp 1376w`}
        sizes={sizes}
      />
      <img
        src={`/images/${base}-1376.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        className={className}
      />
    </picture>
  );
};
