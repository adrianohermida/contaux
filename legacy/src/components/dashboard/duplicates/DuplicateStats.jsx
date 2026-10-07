import React from 'react';
import { Users } from 'lucide-react';

export default function DuplicateStats() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Detecção de Duplicatas
        </h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Identifique contatos duplicados baseado em email, documento e nome similar.
      </p>
    </div>
  );
}