import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ClipboardCopy({ text, label, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex items-center gap-[var(--spacing-sm)] ${className}`}>
      <code className="flex-1 text-[var(--font-size-xs)] bg-[var(--color-background-secondary)] dark:bg-[var(--color-background-tertiary)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded font-mono break-all">
        {text}
      </code>
      <Button
        onClick={handleCopy}
        variant="ghost"
        size="sm"
        className="shrink-0 text-[var(--color-foreground-primary)]"
        title={copied ? 'Copiado!' : `Copiar ${label || 'texto'}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-[var(--color-success)]" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}