import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';

const VALIDATION_RULES = {
  report_name: { label: 'Nome do Relatório', required: true, minLength: 3 },
  period_start: { label: 'Data Inicial', required: true },
  period_end: { label: 'Data Final', required: true }
};

export default function ReportForm({ tenantId, userId, onSuccess, onClose, isOpen = true }) {
  const initialData = useMemo(() => ({
    report_name: '',
    report_type: 'financial',
    period_start: '',
    period_end: '',
    data_source: 'all',
    notes: ''
  }), []);

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(initialData);
  const { errors, validateForm, clearErrors } = useFormValidation();
  const { loading, submit } = useFormSubmit();

  const reportTypeOptions = [
    { value: 'financial', label: 'Financeiro' },
    { value: 'operational', label: 'Operacional' },
    { value: 'compliance', label: 'Conformidade' },
    { value: 'custom', label: 'Customizado' }
  ];

  const dataSourceOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'invoice', label: 'Faturas' },
    { value: 'payment', label: 'Pagamentos' },
    { value: 'account', label: 'Contas' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(formData, VALIDATION_RULES)) return;

    await submit(
      async () => {
        await base44.entities.Report.create({
          ...formData,
          tenant_id: tenantId,
          status: 'draft',
          generated_by: userId
        });
      },
      {
        onSuccess: () => { reset(); onSuccess(); },
        successMessage: 'Relatório criado com sucesso!',
        errorMessage: 'Erro ao criar relatório.',
        tenantId,
        entityType: 'Report',
        action: 'create'
      }
    );
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Novo Relatório" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome do Relatório" name="report_name" value={formData.report_name} onChange={handleChange} error={errors.report_name} placeholder="Ex: Relatório Financeiro Janeiro 2025" required />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tipo" type="select" name="report_type" value={formData.report_type} onChange={(v) => setFieldValue('report_type', v)} options={reportTypeOptions} />
          <FormField label="Fonte de Dados" type="select" name="data_source" value={formData.data_source} onChange={(v) => setFieldValue('data_source', v)} options={dataSourceOptions} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Data Inicial" type="date" name="period_start" value={formData.period_start} onChange={handleChange} error={errors.period_start} required />
          <FormField label="Data Final" type="date" name="period_end" value={formData.period_end} onChange={handleChange} error={errors.period_end} required />
        </div>

        <FormField label="Notas (opcional)" type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Observações adicionais..." rows={2} />

        <FormActions onCancel={onClose} onSubmit={handleSubmit} loading={loading} submitLabel="Criar Relatório" isDirty={isDirty} />
      </form>
    </ModalWrapper>
  );
}