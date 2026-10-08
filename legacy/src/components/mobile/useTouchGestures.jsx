/**
 * useTouchGestures Hook
 * Handle swipe, pinch, and other touch gestures on mobile
 */

import { useEffect, useRef, useState } from 'react';

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  threshold = 50,
} = {}) {
  const [touches, setTouches] = useState({});
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    // Detect pinch (two-finger touch)
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouches({ isPinch: true, initialDistance: distance });
    }
  };

  const handleTouchMove = (e) => {
    if (touches.isPinch && e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / (touches.initialDistance || 1);

      if (onPinch) {
        onPinch(scale);
      }
    }
  };

  const handleTouchEnd = (e) => {
    touchEndRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEndRef.current.x - touchStartRef.current.x;
    const dy = touchEndRef.current.y - touchStartRef.current.y;

    // Detect swipe direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (dx < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (dy > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (dy < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }

    setTouches({});
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isGesturing: touches.isPinch || false,
  };
}