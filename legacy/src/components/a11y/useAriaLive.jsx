/**
 * useAriaLive Hook
 * Wrapper for ARIA live region announcements
 */

import { useCallback } from 'react';
import { useAccessibility } from './AccessibilityProvider';

export function useAriaLive() {
  const { announce, clearAnnouncement } = useAccessibility();

  const announceMessage = useCallback((message, priority = 'polite') => {
    announce(message, priority);
    // Auto-clear after 5 seconds
    setTimeout(clearAnnouncement, 5000);
  }, [announce, clearAnnouncement]);

  const announceError = useCallback((message) => {
    announceMessage(`Error: ${message}`, 'assertive');
  }, [announceMessage]);

  const announceSuccess = useCallback((message) => {
    announceMessage(`Success: ${message}`, 'polite');
  }, [announceMessage]);

  const announceWarning = useCallback((message) => {
    announceMessage(`Warning: ${message}`, 'polite');
  }, [announceMessage]);

  return {
    announce: announceMessage,
    announceError,
    announceSuccess,
    announceWarning,
  };
}

export default useAriaLive;