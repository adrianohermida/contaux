/**
 * PWA Install Prompt
 * Solicita instalação da app no dispositivo (mobile/desktop)
 */

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-700 z-40"
      role="dialog"
      aria-labelledby="install-title"
      aria-describedby="install-desc"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 
          id="install-title"
          className="text-base font-semibold text-slate-900 dark:text-slate-100"
        >
          Instalar App
        </h3>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <p 
        id="install-desc"
        className="text-sm text-slate-600 dark:text-slate-400 mb-4"
      >
        Instale a app no seu dispositivo para acesso rápido e funcionalidades offline.
      </p>

      <div className="flex gap-2">
        <Button
          onClick={handleDismiss}
          variant="outline"
          size="sm"
          className="flex-1 min-h-[40px]"
        >
          Depois
        </Button>
        <Button
          onClick={handleInstall}
          size="sm"
          className="flex-1 gap-2 min-h-[40px]"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Instalar
        </Button>
      </div>
    </div>
  );
}