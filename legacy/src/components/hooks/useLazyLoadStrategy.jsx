/**
 * useLazyLoadStrategy Hook
 * Advanced lazy loading and intersection observer management
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useLazyLoadStrategy() {
  const [loadedElements, setLoadedElements] = useState(new Set());
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef(null);

  // Create intersection observer
  const createObserver = useCallback((options = {}) => {
    const defaultOptions = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '50px',
      ...options,
    };

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
            setLoadedElements((prev) => new Set([...prev, entry.target.id]));
          } else {
            setVisibleElements((prev) => {
              const newSet = new Set(prev);
              newSet.delete(entry.target.id);
              return newSet;
            });
          }
        });
      }, defaultOptions);

      observerRef.current = observer;
      return observer;
    }

    return null;
  }, []);

  // Register element for lazy loading
  const registerElement = useCallback(
    (element, id) => {
      if (!observerRef.current && typeof window !== 'undefined') {
        createObserver();
      }

      if (element && observerRef.current) {
        element.id = id;
        observerRef.current.observe(element);
      }
    },
    [createObserver]
  );

  // Unregister element
  const unregisterElement = useCallback((element) => {
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  // Lazy load images
  const lazyLoadImage = useCallback((element) => {
    if (!element || !element.dataset.src) return;

    const img = element;
    const src = img.dataset.src;

    const loadImage = () => {
      img.src = src;
      img.onload = () => {
        img.classList.add('loaded');
      };
      img.onerror = () => {
        img.classList.add('error');
      };
    };

    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      img.loading = 'lazy';
      img.src = src;
    } else {
      // Fallback to intersection observer
      if (loadedElements.has(element.id)) {
        loadImage();
      }
    }
  }, [loadedElements]);

  // Lazy load component
  const lazyLoadComponent = useCallback((componentLoader, id) => {
    if (loadedElements.has(id)) {
      return componentLoader();
    }
    return null;
  }, [loadedElements]);

  // Prefetch resource
  const prefetchResource = useCallback((url, type = 'script') => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = type;
      document.head.appendChild(link);
    }
  }, []);

  // Preload critical resource
  const preloadResource = useCallback((url, type = 'script') => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      document.head.appendChild(link);
    }
  }, []);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    loadedElements,
    visibleElements,
    createObserver,
    registerElement,
    unregisterElement,
    lazyLoadImage,
    lazyLoadComponent,
    prefetchResource,
    preloadResource,
  };
}

export default useLazyLoadStrategy;