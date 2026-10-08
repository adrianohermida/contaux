import React from 'react';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-[var(--spacing-md)]">
      <div className="text-center">
        <h1 className="text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)]">Contaux</h1>
        <p className="text-[var(--font-size-lg)] text-[var(--color-foreground-secondary)] mt-[var(--spacing-sm)]">Gestão Financeira & Jurídica Integrada</p>
      </div>
    </div>
  );
}