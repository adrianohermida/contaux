/**
 * Toast Notification Component
 * Global notification system for errors, success, warnings
 */

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const toastConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-500',
    duration: 5000,
  },
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600 dark:text-green-500',
    duration: 3000,
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600 dark:text-yellow-500',
    duration: 4000,
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-500',
    duration: 3000,
  },
};

export default function ToastNotification({ 
  message, 
  type = 'info', 
  onClose,
  duration,
  action
}) {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;
  const displayDuration = duration || config.duration;

  useEffect(() => {
    if (displayDuration > 0) {
      const timer = setTimeout(onClose, displayDuration);
      return () => clearTimeout(timer);
    }
  }, [displayDuration, onClose]);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      
      <div className="flex-1">
        <p className={`text-sm font-medium ${config.textColor}`}>
          {message}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className={`text-sm font-medium mt-2 underline hover:opacity-80 ${config.textColor}`}
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={onClose}
        className={`flex-shrink-0 ${config.textColor} hover:opacity-70`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}