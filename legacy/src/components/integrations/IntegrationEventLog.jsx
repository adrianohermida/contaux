/**
 * Integration Event Log
 * Track webhook deliveries and API calls
 */

import React, { useState, useMemo } from 'react';
import { Filter, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
  failed: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
  pending: { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
};

export default function IntegrationEventLog({ workspaceId }) {
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch event logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['integration-logs', workspaceId, statusFilter],
    queryFn: async () => {
      const query = { workspace_id: workspaceId };
      if (statusFilter !== 'all') query.status = statusFilter;
      return await base44.entities.IntegrationLog?.filter(query) || [];
    },
    enabled: !!workspaceId,
  });

  // Sort logs by date (newest first)
  const sortedLogs = useMemo(
    () => logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    [logs]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Log de Eventos
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {sortedLogs.length} eventos
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 min-h-[40px]" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs List */}
      {sortedLogs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhum evento registrado
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedLogs.map(log => {
            const config = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${config.color}`} aria-hidden="true" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100 break-all">
                        {log.event_type}
                      </p>
                      <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {format(new Date(log.created_date), 'HH:mm:ss', { locale: ptBR })}
                      </time>
                    </div>

                    {log.webhook_url && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 break-all mb-1">
                        {log.webhook_url}
                      </p>
                    )}

                    {log.status_code && (
                      <p className={`text-xs font-medium ${
                        log.status_code >= 200 && log.status_code < 300
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Status {log.status_code}
                      </p>
                    )}

                    {log.error_message && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 break-words">
                        {log.error_message}
                      </p>
                    )}

                    {log.response_time_ms && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {log.response_time_ms}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}