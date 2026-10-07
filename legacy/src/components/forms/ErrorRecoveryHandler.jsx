/**
 * Error Recovery Handler Component
 * Displays errors with smart recovery suggestions
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCw, X } from 'lucide-react';
import { useSmartRetry } from '../hooks/useSmartRetry';

const ERROR_STRATEGIES = {
  network: {
    icon: AlertTriangle,
    title: 'Connection Error',
    message: 'Unable to reach the server. Check your internet connection.',
    actions: ['retry', 'offline'],
  },
  validation: {
    icon: AlertTriangle,
    title: 'Validation Error',
    message: 'Please check the form fields marked in red.',
    actions: ['fix'],
  },
  server: {
    icon: AlertTriangle,
    title: 'Server Error',
    message: 'An error occurred on the server. Please try again.',
    actions: ['retry'],
  },
  timeout: {
    icon: AlertTriangle,
    title: 'Request Timeout',
    message: 'The request took too long. Please try again.',
    actions: ['retry', 'cancel'],
  },
};

export default function ErrorRecoveryHandler({
  error,
  errorType = 'server',
  onRetry,
  onDismiss,
  onGoOffline,
  isRetrying = false,
  retryCount = 0,
}) {
  const { executeWithRetry } = useSmartRetry(3, 1000);
  const config = ERROR_STRATEGIES[errorType] || ERROR_STRATEGIES.server;
  const Icon = config.icon;

  const handleRetry = useCallback(async () => {
    if (onRetry) {
      try {
        await executeWithRetry(onRetry, (attempt, delay) => {
          console.log(`Retry attempt ${attempt} in ${delay}ms`);
        });
      } catch (err) {
        console.error('Retry failed:', err);
      }
    }
  }, [executeWithRetry, onRetry]);

  return (
    <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 space-y-3">
      {/* Header */}
      <div className="flex gap-3 items-start">
        <Icon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-200">
            {config.title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {config.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          aria-label="Dismiss error"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Details */}
      {error?.message && (
        <div className="text-xs text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded">
          {error.message}
        </div>
      )}

      {/* Retry Counter */}
      {isRetrying && retryCount > 0 && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Retry attempt {retryCount}...
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {config.actions.includes('retry') && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}

        {config.actions.includes('offline') && (
          <Button
            size="sm"
            variant="outline"
            onClick={onGoOffline}
            className="border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            Work Offline
          </Button>
        )}

        {config.actions.includes('fix') && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            Review Fields
          </Button>
        )}

        {config.actions.includes('cancel') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-red-600 dark:text-red-400"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}