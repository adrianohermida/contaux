/**
 * useUserPreferences Hook
 * User preference management and persistence
 */

import { useState, useCallback, useEffect } from 'react';

export function useUserPreferences(userId) {
  const [preferences, setPreferences] = useState({
    theme: 'dark', // 'dark' or 'light'
    language: 'pt-BR',
    notifications: true,
    emailUpdates: false,
    layoutMode: 'full', // 'full' or 'compact'
    sidebarCollapsed: false,
    autoSave: true,
  });

  const storageKey = `user_preferences_${userId}`;

  // Load preferences from storage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, [userId, storageKey]);

  // Update preference
  const updatePreference = useCallback(
    (key, value) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey]
  );

  // Bulk update
  const updatePreferences = useCallback(
    (updates) => {
      setPreferences((prev) => {
        const updated = { ...prev, ...updates };
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey]
  );

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    const defaults = {
      theme: 'dark',
      language: 'pt-BR',
      notifications: true,
      emailUpdates: false,
      layoutMode: 'full',
      sidebarCollapsed: false,
      autoSave: true,
    };
    setPreferences(defaults);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
  }, [storageKey]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
  };
}

export default useUserPreferences;