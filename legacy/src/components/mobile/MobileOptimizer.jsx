/**
 * Mobile Optimizer
 * Apply mobile optimizations like viewport settings and gesture handling
 */

import React, { useEffect } from 'react';

export function MobileOptimizer() {
  useEffect(() => {
    // Set viewport meta tags for mobile
    const setViewportMeta = () => {
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (existingViewport) {
        existingViewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover'
        );
      }
    };

    // Prevent double-tap zoom (use faster click)
    const preventDoubleTap = (e) => {
      const touch = e.touches[0];
      const target = touch.target;

      // Allow clicks on interactive elements
      if (
        target.matches('button') ||
        target.matches('a') ||
        target.matches('input') ||
        target.matches('[role="button"]')
      ) {
        return;
      }

      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Optimize fonts for mobile
    const optimizeFonts = () => {
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          document.documentElement.classList.add('fonts-loaded');
        });
      }
    };

    // Disable hover effects on touch devices
    const addTouchClass = () => {
      if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device');
      }
    };

    setViewportMeta();
    optimizeFonts();
    addTouchClass();

    // Add touch event listener
    document.addEventListener('touchmove', preventDoubleTap, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventDoubleTap);
    };
  }, []);

  return null; // No UI needed
}