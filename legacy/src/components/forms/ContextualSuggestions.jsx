/**
 * Contextual Suggestions Component
 * Displays smart hints and field validation suggestions
 */

import React from 'react';
import { AlertCircle, Lightbulb, CheckCircle } from 'lucide-react';

export default function ContextualSuggestions({
  hint,
  suggestion,
  isValid,
  message,
  fieldName,
}) {
  if (!hint && !suggestion && message === null) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Validation Message */}
      {message && (
        <div className="flex gap-2 items-start p-2 rounded bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700 dark:text-red-300">{message}</span>
        </div>
      )}

      {/* Success Message */}
      {isValid && message === null && (
        <div className="flex gap-2 items-start p-2 rounded bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-green-700 dark:text-green-300">Valid format</span>
        </div>
      )}

      {/* Hint */}
      {hint && !message && (
        <div className="flex gap-2 items-start p-2 rounded bg-blue-50 dark:bg-blue-900/20">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-blue-700 dark:text-blue-300">{hint}</span>
        </div>
      )}

      {/* Smart Suggestion */}
      {suggestion && (
        <div className="flex gap-2 items-start p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
          <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-yellow-700 dark:text-yellow-300">{suggestion}</span>
        </div>
      )}
    </div>
  );
}