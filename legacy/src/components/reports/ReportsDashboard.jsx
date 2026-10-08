/**
 * Reports Dashboard
 * View and manage generated reports
 */

import React, { useState, useMemo } from 'react';
import { Loader2, Download, Trash2, Eye, Filter, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReportBuilder from './ReportBuilder';

export default function ReportsDashboard({ workspaceId }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports', workspaceId, typeFilter],
    queryFn: async () => {
      const query = { workspace_id: workspaceId };
      if (typeFilter !== 'all') query.type = typeFilter;
      return await base44.entities.Report?.filter(query) || [];
    },
    enabled: !!workspaceId,
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: (reportId) => base44.entities.Report?.delete(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] });
      setDeleteId(null);
    },
  });

  // Export to PDF mutation
  const exportMutation = useMutation({
    mutationFn: async (reportId) => {
      const report = reports.find(r => r.id === reportId);
      // Call backend function to generate PDF
      return await base44.functions.invoke('generateReportPDF', { reportId, report });
    },
    onSuccess: (data) => {
      if (data.file_url) {
        const link = document.createElement('a');
        link.href = data.file_url;
        link.download = `relatorio-${Date.now()}.pdf`;
        link.click();
      }
    },
  });

  // Sort reports by date
  const sortedReports = useMemo(
    () => reports.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    [reports]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando relatórios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Builder */}
      <ReportBuilder workspaceId={workspaceId} />

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 min-h-[40px]" aria-label="Filtrar por tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="summary">Resumo de Contatos</SelectItem>
            <SelectItem value="tags">Análise de Tags</SelectItem>
            <SelectItem value="activity">Atividades</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {sortedReports.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <BarChart3 className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhum relatório gerado. Crie um para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReports.map(report => (
            <div
              key={report.id}
              className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {report.name}
                  </h3>
                  {report.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 break-words">
                      {report.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                      {report.type === 'summary' && 'Resumo'}
                      {report.type === 'tags' && 'Tags'}
                      {report.type === 'activity' && 'Atividade'}
                      {report.type === 'custom' && 'Customizado'}
                    </span>
                    {report.metrics?.length > 0 && (
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {report.metrics.length} métrica{report.metrics.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Criado em {format(new Date(report.created_date), 'dd MMM, HH:mm', { locale: ptBR })}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => exportMutation.mutate(report.id)}
                  disabled={exportMutation.isPending}
                  className="flex-1 gap-2 min-h-[40px] text-xs"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={() => setDeleteId(report.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[40px] px-3"
                  aria-label="Deletar relatório"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(val) => !val && setDeleteId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Relatório?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este relatório? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}