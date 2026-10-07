/**
 * ValidationError Component
 * Displays field validation errors
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ValidationError({ 
  error, 
  visible = true,
  className = '' 
}) {
  if (!error || !visible) {
    return null;
  }

  return (
    <div 
      className={`flex items-start gap-2 p-2 text-sm ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <span className="text-red-700 dark:text-red-300">
        {error}
      </span>
    </div>
  );
}