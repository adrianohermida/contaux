import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastNotification({ message, type = 'success', onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />,
    info: <Info className="w-5 h-5 text-[var(--color-interactive-default)]" />,
  };

  const colors = {
    success: 'bg-[var(--color-background-secondary)] border-[var(--color-border-default)]',
    error: 'bg-[var(--color-background-secondary)] border-[var(--color-border-default)]',
    info: 'bg-[var(--color-background-secondary)] border-[var(--color-border-default)]',
  };

  const textColors = {
    success: 'text-[var(--color-foreground-primary)]',
    error: 'text-[var(--color-foreground-primary)]',
    info: 'text-[var(--color-foreground-primary)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${colors[type]} border rounded-lg p-[var(--spacing-md)] shadow-lg flex items-center gap-[var(--spacing-md)] min-w-[300px] max-w-md`}
    >
      {icons[type]}
      <p className={`${textColors[type]} text-[var(--font-size-sm)] font-medium flex-1`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`${textColors[type]} hover:opacity-70 transition-opacity`}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-[var(--spacing-md)] right-[var(--spacing-md)] z-50 gap-[var(--spacing-sm)] flex flex-col">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}