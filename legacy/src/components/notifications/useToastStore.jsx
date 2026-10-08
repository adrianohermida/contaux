/**
 * Toast Notification Store
 * Global state management for notifications
 */

import { useState, useCallback } from 'react';

let toastId = 0;

export function useToastStore() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = toastId++;
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3000,
      action: options.action,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showError = useCallback((message, options = {}) => {
    return addToast(message, { type: 'error', duration: 5000, ...options });
  }, [addToast]);

  const showSuccess = useCallback((message, options = {}) => {
    return addToast(message, { type: 'success', duration: 3000, ...options });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    return addToast(message, { type: 'warning', duration: 4000, ...options });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    return addToast(message, { type: 'info', duration: 3000, ...options });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

export default useToastStore;