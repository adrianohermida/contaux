/**
 * Report Builder
 * Create custom reports with filters and visualizations
 */

import React, { useState } from 'react';
import { Loader2, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const REPORT_TYPES = [
  { value: 'summary', label: 'Resumo de Contatos' },
  { value: 'tags', label: 'Análise de Tags' },
  { value: 'activity', label: 'Atividades' },
  { value: 'custom', label: 'Personalizado' },
];

const METRICS = [
  { value: 'total_contacts', label: 'Total de Contatos' },
  { value: 'active_contacts', label: 'Contatos Ativos' },
  { value: 'contact_type', label: 'Por Tipo (PF/PJ)' },
  { value: 'tags_distribution', label: 'Distribuição de Tags' },
  { value: 'recent_activity', label: 'Atividade Recente' },
];

export default function ReportBuilder({ workspaceId, onReportCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'summary',
    description: '',
    metrics: [],
    filters: {},
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  // Create report mutation
  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.Report?.create({
        workspace_id: workspaceId,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        metrics: formData.metrics,
        filters: formData.filters,
        is_template: false,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] });
      setFormData({ name: '', type: 'summary', description: '', metrics: [], filters: {} });
      setShowForm(false);
      onReportCreated?.(data);
    },
  });

  const handleToggleMetric = (metric) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric],
    }));
  };

  const handleCreate = () => {
    if (!formData.name || formData.metrics.length === 0) return;
    setShowConfirm(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Criar Relatório
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Novo Relatório
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="report-name" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Nome do Relatório
            </label>
            <Input
              id="report-name"
              placeholder="Ex: Contatos Ativos 2026"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="min-h-[44px]"
              aria-label="Nome do relatório"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Tipo de Relatório
            </label>
            <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}>
              <SelectTrigger id="report-type" className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="report-desc" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Descrição (opcional)
            </label>
            <Textarea
              id="report-desc"
              placeholder="Adicione notas sobre este relatório..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px] resize-none"
              aria-label="Descrição do relatório"
            />
          </div>

          {/* Metrics */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-900 dark:text-slate-100">
              Métricas a Incluir
            </label>
            <div className="space-y-2">
              {METRICS.map(metric => (
                <label key={metric.value} className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.metrics.includes(metric.value)}
                    onChange={() => handleToggleMetric(metric.value)}
                    className="w-4 h-4"
                    aria-label={`Incluir ${metric.label}`}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {metric.label}
                  </span>
                </label>
              ))}
            </div>
            {formData.metrics.length === 0 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Selecione pelo menos uma métrica
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={!formData.name || formData.metrics.length === 0}
              className="flex-1 gap-2 min-h-[44px]"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Criar Relatório
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              disabled={createMutation.isPending}
              className="min-h-[44px]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Criar Relatório?</AlertDialogTitle>
            <AlertDialogDescription>
              O relatório "{formData.name}" será criado com as métricas selecionadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                createMutation.mutate();
                setShowConfirm(false);
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}