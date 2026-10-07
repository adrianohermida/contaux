/**
 * Duplicate Detector
 * Finds and manages potential duplicate contacts
 */

import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { findDuplicates } from '@/components/utils/similarityUtils';
import DuplicateResults from './DuplicateResults';
import DuplicateStats from './DuplicateStats';

export default function DuplicateDetector({ workspaceId, onSelectDuplicate }) {
  const [threshold, setThreshold] = useState('70');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Fetch all contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['all-contacts-for-dedup', workspaceId],
    queryFn: async () => {
      return await base44.entities.Client.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId,
  });

  // Calculate duplicates
  const duplicates = useMemo(() => {
    if (contacts.length < 2) return [];
    return findDuplicates(contacts, parseInt(threshold));
  }, [contacts, threshold]);

  // Filter by search
  const filteredDuplicates = useMemo(() => {
    if (!searchTerm) return duplicates;
    
    const term = searchTerm.toLowerCase();
    return duplicates.filter(dup => 
      dup.contact1.company_name.toLowerCase().includes(term) ||
      dup.contact1.email?.toLowerCase().includes(term) ||
      dup.contact2.company_name.toLowerCase().includes(term) ||
      dup.contact2.email?.toLowerCase().includes(term)
    );
  }, [duplicates, searchTerm]);

  const severityStats = useMemo(() => {
    return {
      high: duplicates.filter(d => d.severity === 'high').length,
      medium: duplicates.filter(d => d.severity === 'medium').length,
      low: duplicates.filter(d => d.severity === 'low').length,
    };
  }, [duplicates]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Limite de Similaridade
          </label>
          <Select value={threshold} onValueChange={setThreshold}>
            <SelectTrigger id="threshold" className="min-h-[44px]" aria-label="Limite de similaridade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50% - Baixo</SelectItem>
              <SelectItem value="70">70% - Médio</SelectItem>
              <SelectItem value="85">85% - Alto</SelectItem>
              <SelectItem value="95">95% - Muito Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="dup-search" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="dup-search"
              placeholder="Buscar duplicatas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 min-h-[44px]"
              aria-label="Buscar duplicatas por nome ou email"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {severityStats.high}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Alta</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {severityStats.medium}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Média</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {severityStats.low}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Baixa</p>
        </div>
      </div>

      {/* Stats Button */}
      <Button
        onClick={() => setShowStats(!showStats)}
        variant="outline"
        className="w-full gap-2 min-h-[44px]"
        aria-label="Mostrar/ocultar estatísticas de duplicatas"
      >
        <TrendingUp className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        {showStats ? 'Ocultar' : 'Ver'} Estatísticas
      </Button>

      {showStats && (
        <DuplicateStats contacts={contacts} duplicates={duplicates} />
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
          <span className="text-slate-600 dark:text-slate-400">Analisando contatos...</span>
        </div>
      ) : filteredDuplicates.length === 0 ? (
        <div className="p-8 text-center bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Nenhuma duplicata encontrada!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Base de dados está limpa e sem conflitos
          </p>
        </div>
      ) : (
        <DuplicateResults duplicates={filteredDuplicates} onSelectDuplicate={onSelectDuplicate} />
      )}
    </div>
  );
}