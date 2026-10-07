/**
 * Lazy Image Component
 * Progressive image loading with placeholder
 */

import React, { useState } from 'react';
import { useLazyLoad } from '@/components/hooks/useLazyLoad';
import { Image as ImageIcon } from 'lucide-react';

export default function LazyImage({
  src,
  alt,
  placeholder = 'bg-slate-200 dark:bg-slate-700',
  className = '',
  width,
  height,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, isVisible } = useLazyLoad();

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!loaded && (
        <div
          className={`absolute inset-0 ${placeholder} animate-pulse flex items-center justify-center`}
          aria-hidden="true"
        >
          <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}

      {/* Image */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true);
            setError(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
      )}
    </div>
  );
}