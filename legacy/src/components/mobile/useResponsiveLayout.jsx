/**
 * useResponsiveLayout Hook
 * Detect screen size and provide responsive utilities
 */

import { useEffect, useState, useCallback } from 'react';

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsiveLayout() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState('xs');

  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setScreenSize({ width, height });

    // Determine current breakpoint
    if (width >= BREAKPOINTS.xl) {
      setBreakpoint('xl');
    } else if (width >= BREAKPOINTS.lg) {
      setBreakpoint('lg');
    } else if (width >= BREAKPOINTS.md) {
      setBreakpoint('md');
    } else if (width >= BREAKPOINTS.sm) {
      setBreakpoint('sm');
    } else {
      setBreakpoint('xs');
    }
  }, []);

  useEffect(() => {
    updateScreenSize();

    const handleResize = () => {
      updateScreenSize();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      resizeObserver.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [updateScreenSize]);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md' || breakpoint === 'lg';
  const isDesktop = breakpoint === 'xl';

  return {
    screenSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: screenSize.width < 768,
    isPortrait: screenSize.height > screenSize.width,
  };
}