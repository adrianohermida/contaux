/**
 * CampaignForm Component
 * Create/Edit marketing campaigns with template selection, scheduling, and segmentation
 */

import React, { useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import { useTheme } from '@/components/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Send, Clock } from 'lucide-react';

const CAMPAIGN_TYPES = [
  { value: 'email', label: 'Email Campaign' },
  { value: 'sms', label: 'SMS Campaign' },
  { value: 'push', label: 'Push Notification' },
  { value: 'social', label: 'Social Media' }
];

const CAMPAIGN_STATUSES = [
  'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
];

const RECURRENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

const VALIDATION_RULES = {
  name: { required: true, label: 'Campaign Name', minLength: 3 },
  type: { required: true, label: 'Campaign Type' },
  subject_line: { required: true, label: 'Subject Line', minLength: 5 },
  body_content: { required: true, label: 'Message Body', minLength: 10 },
  recipient_count: { required: true, label: 'Recipients' }
};

export default function CampaignForm({
  campaign,
  workspaceId,
  isOpen,
  onCancel,
  onSuccess
}) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const initialData = useMemo(() => ({
    name: campaign?.name || '',
    type: campaign?.type || 'email',
    description: campaign?.description || '',
    status: campaign?.status || 'draft',
    subject_line: campaign?.subject_line || '',
    body_content: campaign?.body_content || '',
    scheduled_date: campaign?.scheduled_date || '',
    budget: campaign?.budget || 0,
    cost_per_message: campaign?.cost_per_message || 0,
    target_segment: campaign?.target_segment || 'all_contacts',
    is_recurring: campaign?.is_recurring || false,
    recurrence_pattern: campaign?.recurrence_pattern || 'weekly',
    tags: campaign?.tags?.join(', ') || '',
    notes: campaign?.notes || ''
  }), [campaign]);

  const { formData, handleChange, setFieldValue, isDirty } = useFormState(initialData);
  const { errors, validateForm, setFieldError } = useFormValidation();
  const { submit } = useFormSubmit();

  // Load templates
  const { data: templates = [] } = useQuery({
    queryKey: ['templates', workspaceId],
    queryFn: () => base44.entities.Template?.filter({ workspace_id: workspaceId }) || [],
    enabled: !!workspaceId && isOpen
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      const campaignData = {
        ...data,
        workspace_id: workspaceId,
        recipient_count: formData.recipient_count || 0,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (campaign?.id) {
        return await base44.entities.Campaign.update(campaign.id, campaignData);
      } else {
        return await base44.entities.Campaign.create(campaignData);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onSuccess?.(result);
      onCancel();
    }
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm(formData, VALIDATION_RULES)) {
      return;
    }

    await submit({
      tenantId: workspaceId,
      entityType: 'Campaign',
      onSubmit: async () => mutation.mutateAsync(formData)
    });
  }, [formData, validateForm, submit, mutation, workspaceId]);

  const isCreating = !campaign;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onCancel}
      title={isCreating ? 'Nova Campanha' : 'Editar Campanha'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={`space-y-6 ${theme === 'dark' ? 'dark:bg-slate-900' : ''}`}>
        
        {/* Campaign Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="name"
            label="Nome da Campanha"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Inserir nome da campanha"
            required
          />
          <FormField
            name="type"
            label="Tipo de Campanha"
            type="select"
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            options={CAMPAIGN_TYPES}
            required
          />
        </div>

        {/* Description */}
        <FormField
          name="description"
          label="Descrição"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Objetivos e detalhes da campanha"
          rows={3}
        />

        {/* Subject & Body */}
        {formData.type === 'email' && (
          <div className="space-y-4">
            <FormField
              name="subject_line"
              label="Assunto do Email"
              type="text"
              value={formData.subject_line}
              onChange={handleChange}
              error={errors.subject_line}
              placeholder="Inserir assunto"
              required
            />
            <FormField
              name="body_content"
              label="Conteúdo da Mensagem"
              type="textarea"
              value={formData.body_content}
              onChange={handleChange}
              error={errors.body_content}
              placeholder="Corpo do email (HTML ou texto)"
              rows={6}
              required
            />
          </div>
        )}

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <FormField
            name="scheduled_date"
            label="Data de Agendamento"
            type="datetime-local"
            value={formData.scheduled_date}
            onChange={handleChange}
          />
          <FormField
            name="status"
            label="Status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            options={CAMPAIGN_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          />
        </div>

        {/* Budget & Costs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="budget"
            label="Orçamento"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
          />
          <FormField
            name="cost_per_message"
            label="Custo por Mensagem"
            type="number"
            value={formData.cost_per_message}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        {/* Targeting */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <FormField
            name="target_segment"
            label="Segmento Alvo"
            type="select"
            value={formData.target_segment}
            onChange={handleChange}
            options={[
              { value: 'all_contacts', label: 'Todos os Contatos' },
              { value: 'hot_leads', label: 'Hot Leads (70+)' },
              { value: 'warm_leads', label: 'Warm Leads (30-70)' },
              { value: 'cold_leads', label: 'Cold Leads (<30)' },
              { value: 'recent_activity', label: 'Atividade Recente' }
            ]}
          />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Selecione o público-alvo para a campanha
          </p>
        </div>

        {/* Recurring Settings */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFieldValue('is_recurring', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium">Campanha Recorrente</span>
          </label>

          {formData.is_recurring && (
            <FormField
              name="recurrence_pattern"
              label="Padrão de Recorrência"
              type="select"
              value={formData.recurrence_pattern}
              onChange={handleChange}
              options={RECURRENCE_OPTIONS}
            />
          )}
        </div>

        {/* Tags */}
        <FormField
          name="tags"
          label="Tags (separadas por vírgula)"
          type="text"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., promotional, seasonal, important"
        />

        {/* Notes */}
        <FormField
          name="notes"
          label="Notas Internas"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notas para a equipe"
          rows={2}
        />

        {/* Campaign Info Display */}
        {!isCreating && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Informações da Campanha
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Status</p>
                <Badge>{campaign.status}</Badge>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Enviados</p>
                <p className="font-semibold">{campaign.sent_count || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <FormActions
          isDirty={isDirty}
          isLoading={mutation.isPending}
          onCancel={onCancel}
          onSubmit={handleSubmit}
          submitLabel={isCreating ? 'Criar Campanha' : 'Atualizar Campanha'}
        />
      </form>
    </ModalWrapper>
  );
}