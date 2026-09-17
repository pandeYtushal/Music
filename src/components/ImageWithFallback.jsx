import { useState } from 'react';
import { BsMusicNoteBeamed } from 'react-icons/bs';

/**
 * A robust image component with lazy loading, skeleton, and fallback handling.
 * Ensures the UI never breaks due to 404 or slow-loading API images.
 */
export default function ImageWithFallback({ src, alt, className = '', fallbackIconSize = 24 }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback to use when image fails to load
  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-surface-raised text-muted ${className}`}>
        <BsMusicNoteBeamed size={fallbackIconSize} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton loader shown while image is loading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-surface-raised" />
      )}
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
