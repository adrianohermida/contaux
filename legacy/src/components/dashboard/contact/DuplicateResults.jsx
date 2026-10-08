/**
 * Duplicate Results List
 * Display potential duplicates with merge options
 */

import React from 'react';
import { AlertCircle, ChevronRight, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SEVERITY_CONFIG = {
  high: {
    color: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    label: 'Muito Provável',
    icon: '🔴',
  },
  medium: {
    color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    label: 'Provável',
    icon: '🟡',
  },
  low: {
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    label: 'Possível',
    icon: '🔵',
  },
};

export default function DuplicateResults({ duplicates = [], onSelectDuplicate }) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {duplicates.map((duplicate) => {
        const config = SEVERITY_CONFIG[duplicate.severity];
        const scorePercent = Math.min(100, duplicate.score);

        return (
          <div
            key={duplicate.id}
            className={`p-4 border rounded-lg ${config.color}`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {duplicate.contact1.company_name}
                    </p>
                    <p className="text-xs opacity-75">
                      ↔ {duplicate.contact2.company_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-lg font-bold">{duplicate.score}%</span>
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                </div>

                {/* Similarity Bar */}
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-black/40 transition-all duration-300"
                    style={{ width: `${scorePercent}%` }}
                    role="progressbar"
                    aria-valuenow={scorePercent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Similaridade: ${scorePercent}%`}
                  />
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="space-y-1">
                    <p className="opacity-75">Email:</p>
                    <p className="break-all">{duplicate.contact1.email || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="opacity-75">Email:</p>
                    <p className="break-all">{duplicate.contact2.email || '—'}</p>
                  </div>
                </div>

                {/* Documents */}
                {(duplicate.contact1.cnpj || duplicate.contact1.cpf) && (
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="opacity-75">
                      {duplicate.contact1.cnpj ? `CNPJ: ${duplicate.contact1.cnpj}` : `CPF: ${duplicate.contact1.cpf}`}
                    </div>
                    <div className="opacity-75">
                      {duplicate.contact2.cnpj ? `CNPJ: ${duplicate.contact2.cnpj}` : `CPF: ${duplicate.contact2.cpf}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => onSelectDuplicate?.(duplicate)}
              className="w-full mt-3 gap-2 bg-black/20 hover:bg-black/30 text-current min-h-[44px]"
              aria-label={`Visualizar opções de merge para ${duplicate.contact1.company_name} e ${duplicate.contact2.company_name}`}
            >
              <GitMerge className="w-4 h-4" aria-hidden="true" />
              Revisar Merge
              <ChevronRight className="w-4 h-4 ml-auto" aria-hidden="true" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}