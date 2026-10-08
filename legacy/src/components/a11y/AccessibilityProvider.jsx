/**
 * Accessibility Provider
 * Centralized management of keyboard navigation, ARIA labels, and a11y features
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [ariaLiveRegion, setAriaLiveRegion] = useState(null);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setKeyboardMode(true);
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    setAriaLiveRegion({ message, priority, id: Date.now() });
  }, []);

  const clearAnnouncement = useCallback(() => {
    setAriaLiveRegion(null);
  }, []);

  const value = {
    keyboardMode,
    focusVisible,
    announce,
    clearAnnouncement,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* ARIA Live Region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {ariaLiveRegion?.message}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {ariaLiveRegion?.priority === 'assertive' && ariaLiveRegion?.message}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export default AccessibilityProvider;