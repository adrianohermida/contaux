import React from 'react';
import { Button } from '@/components/ui/button';

export default function ContactModal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">✕</Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}