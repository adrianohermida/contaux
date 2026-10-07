/**
 * useKeyboardNavigation Hook
 * Manages keyboard navigation patterns (Arrow keys, Enter, Escape, etc)
 */

import { useEffect, useCallback, useRef } from 'react';

export function useKeyboardNavigation({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onTab,
  disabled = false,
} = {}) {
  const containerRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowUp':
        if (onArrowUp) {
          e.preventDefault();
          onArrowUp();
        }
        break;

      case 'ArrowDown':
        if (onArrowDown) {
          e.preventDefault();
          onArrowDown();
        }
        break;

      case 'ArrowLeft':
        if (onArrowLeft) {
          e.preventDefault();
          onArrowLeft();
        }
        break;

      case 'ArrowRight':
        if (onArrowRight) {
          e.preventDefault();
          onArrowRight();
        }
        break;

      case 'Enter':
      case ' ':
        if (onEnter) {
          e.preventDefault();
          onEnter();
        }
        break;

      case 'Escape':
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        break;

      case 'Tab':
        if (onTab) {
          onTab(e.shiftKey);
        }
        break;

      default:
        break;
    }
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onTab, disabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return containerRef;
}

/**
 * Focus management utilities
 */
export function useFocusManagement(containerRef) {
  const moveFocusToFirst = useCallback(() => {
    const focusable = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length > 0) {
      focusable[0].focus();
    }
  }, [containerRef]);

  const moveFocusToLast = useCallback(() => {
    const focusable = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  }, [containerRef]);

  const getFocusableElements = useCallback(() => {
    return containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) || [];
  }, [containerRef]);

  return {
    moveFocusToFirst,
    moveFocusToLast,
    getFocusableElements,
  };
}

export default useKeyboardNavigation;