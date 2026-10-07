/**
 * SalesOpportunityForm Component
 * Create/Edit sales opportunities with lead scoring and pipeline management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import ModalWrapper from '@/components/modals/ModalWrapper';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, TrendingUp, Target } from 'lucide-react';

const VALIDATION_RULES = {
  opportunity_name: { required: 'Nome é obrigatório' },
  deal_value: { required: 'Valor é obrigatório' },
  expected_close_date: { required: 'Data esperada é obrigatória' },
};

const PIPELINE_STAGES = [
  { value: 'prospect', label: 'Prospecção', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { value: 'qualified', label: 'Qualificado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'proposal', label: 'Proposta', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'negotiation', label: 'Negociação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'won', label: 'Ganho', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

const SOURCES = [
  { value: 'direct', label: 'Direto' },
  { value: 'referral', label: 'Indicação' },
  { value: 'website', label: 'Website' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'other', label: 'Outro' },
];

const calculateLeadScore = (opportunity) => {
  let score = 0;

  // Deal value score (0-20)
  if (opportunity.deal_value > 0) {
    score += Math.min(20, (opportunity.deal_value / 10000) * 20);
  }

  // Pipeline stage score (0-30)
  const stageScores = {
    prospect: 5,
    qualified: 15,
    proposal: 20,
    negotiation: 25,
    won: 30,
    lost: 0,
  };
  score += stageScores[opportunity.pipeline_stage] || 0;

  // Conversion probability score (0-20)
  score += (opportunity.conversion_probability / 100) * 20;

  // Activity recency score (0-20)
  if (opportunity.last_activity_date) {
    const daysSinceActivity = Math.floor(
      (new Date() - new Date(opportunity.last_activity_date)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActivity <= 7) score += 20;
    else if (daysSinceActivity <= 30) score += 15;
    else if (daysSinceActivity <= 60) score += 10;
    else score += 5;
  }

  // Expected close date score (0-10)
  if (opportunity.expected_close_date) {
    const daysToClose = Math.floor(
      (new Date(opportunity.expected_close_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysToClose <= 30) score += 10;
    else if (daysToClose <= 90) score += 7;
    else score += 3;
  }

  return Math.min(100, Math.round(score));
};

const getScoreCategory = (score) => {
  if (score >= 70) return { label: 'Quente', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
  if (score >= 30) return { label: 'Morna', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
  return { label: 'Fria', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
};

export default function SalesOpportunityForm({ opportunity, workspaceId, onSave, onCancel, isOpen = true }) {
  const queryClient = useQueryClient();

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(
    opportunity || {
      workspace_id: workspaceId,
      opportunity_name: '',
      deal_value: 0,
      pipeline_stage: 'prospect',
      conversion_probability: 0,
      lead_score: 0,
      expected_close_date: '',
      last_activity_date: new Date().toISOString().split('T')[0],
      description: '',
      source: 'direct',
      is_active: true,
      tags: [],
    }
  );

  const { errors, validateForm, clearErrors } = useFormValidation(VALIDATION_RULES);
  const { loading, submit, error: submitError } = useFormSubmit();

  // Calculate lead score dynamically
  const leadScore = useMemo(() => calculateLeadScore(formData), [formData]);
  const scoreCategory = useMemo(() => getScoreCategory(leadScore), [leadScore]);

  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['clients', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }, '-updated_date', 100),
    enabled: !!workspaceId,
  });

  // Get stage color
  const getStageColor = (stage) => {
    const found = PIPELINE_STAGES.find(s => s.value === stage);
    return found?.color || '';
  };

  const handleSubmit = async () => {
    clearErrors();
    if (!validateForm(formData)) {
      return;
    }

    const submitData = {
      ...formData,
      lead_score: leadScore,
    };

    await submit(
      async () => {
        if (opportunity?.id) {
          await base44.entities.SalesOpportunity.update(opportunity.id, submitData);
        } else {
          await base44.entities.SalesOpportunity.create(submitData);
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['opportunities', workspaceId] });
          reset();
          onSave?.();
        },
      }
    );
  };

  const stageLabel = PIPELINE_STAGES.find(s => s.value === formData.pipeline_stage)?.label || '';

  return (
    <ModalWrapper
      isOpen={isOpen}
      title={opportunity ? 'Editar Oportunidade' : 'Nova Oportunidade'}
      onClose={onCancel}
      size="lg"
    >
      <form className="space-y-6 dark:bg-slate-900">
        {/* Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Informações Gerais
          </h3>

          <FormField
            label="Contato/Cliente"
            name="contact_id"
            type="select"
            value={formData.contact_id}
            onChange={(value) => setFieldValue('contact_id', value)}
            options={contacts.map(c => ({
              value: c.id,
              label: c.company_name
            }))}
            required
            error={errors.contact_id}
          />

          <FormField
            label="Nome da Oportunidade"
            name="opportunity_name"
            type="text"
            value={formData.opportunity_name}
            onChange={handleChange}
            required
            error={errors.opportunity_name}
            placeholder="Ex: Projeto XYZ - Implementação"
          />

          <FormField
            label="Valor da Oportunidade"
            name="deal_value"
            type="number"
            value={formData.deal_value}
            onChange={handleChange}
            required
            error={errors.deal_value}
            min="0"
            step="0.01"
          />

          <FormField
            label="Origem"
            name="source"
            type="select"
            value={formData.source}
            onChange={(value) => setFieldValue('source', value)}
            options={SOURCES}
          />
        </div>

        {/* Pipeline Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Pipeline & Probabilidade
          </h3>

          <FormField
            label="Estágio do Pipeline"
            name="pipeline_stage"
            type="select"
            value={formData.pipeline_stage}
            onChange={(value) => setFieldValue('pipeline_stage', value)}
            options={PIPELINE_STAGES}
          />

          <FormField
            label="Probabilidade de Conversão (%)"
            name="conversion_probability"
            type="number"
            value={formData.conversion_probability}
            onChange={handleChange}
            min="0"
            max="100"
          />

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lead Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{leadScore}</span>
                <Badge className={scoreCategory.color}>{scoreCategory.label}</Badge>
              </div>
            </div>
            <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  leadScore >= 70
                    ? 'bg-red-500'
                    : leadScore >= 30
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${leadScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dates Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Datas</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Data Esperada de Fechamento"
              name="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={handleChange}
              required
              error={errors.expected_close_date}
            />

            <FormField
              label="Última Atividade"
              name="last_activity_date"
              type="date"
              value={formData.last_activity_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detalhes</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Descrição/Notas
            </label>
            <Textarea
              placeholder="Detalhes sobre a oportunidade..."
              value={formData.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              rows={4}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
            {submitError}
          </div>
        )}

        <FormActions
          onCancel={onCancel}
          onSubmit={handleSubmit}
          isDirty={isDirty}
          loading={loading}
        />
      </form>
    </ModalWrapper>
  );
}