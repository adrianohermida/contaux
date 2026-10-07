import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';

const VALIDATION_RULES = {
  process_number: { label: 'Nº Processo', required: true },
  title: { label: 'Título', required: true, minLength: 3 },
  client_id: { label: 'Cliente', required: true },
  filing_date: { label: 'Data de Protocolo', required: true }
};

export default function LegalProcessForm({ process, onSave, onCancel, tenantId, isOpen = true }) {
  const initialData = useMemo(() => process || {
    tenant_id: tenantId,
    workspace_id: tenantId,
    client_id: '',
    process_number: '',
    title: '',
    court: '',
    judge: '',
    process_type: 'civil',
    status: 'in_progress',
    priority: 'medium',
    filing_date: '',
    next_hearing_date: '',
    description: '',
    responsible_lawyer: '',
    notes: ''
  }, [process, tenantId]);

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.Client.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId
  });

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(initialData);
  const { errors, validateForm, clearErrors } = useFormValidation();
  const { loading, submit } = useFormSubmit();

  const processTypeOptions = [
    { value: 'civil', label: 'Civil' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'administrative', label: 'Administrativo' },
    { value: 'labor', label: 'Trabalhista' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'awaiting_decision', label: 'Aguardando Decisão' },
    { value: 'closed', label: 'Fechado' },
    { value: 'archived', label: 'Arquivado' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(formData, VALIDATION_RULES)) return;

    // Validar datas
    if (formData.filing_date && formData.next_hearing_date) {
      if (new Date(formData.next_hearing_date) < new Date(formData.filing_date)) {
        toast.error('Data da próxima audiência não pode ser anterior à data de protocolo');
        return;
      }
    }

    try {
      await submit(
        async () => {
          const dataToSave = {
            ...formData,
            tenant_id: tenantId,
            workspace_id: tenantId
          };
          if (process?.id) {
            await base44.entities.LegalProcess.update(process.id, dataToSave);
          } else {
            await base44.entities.LegalProcess.create(dataToSave);
          }
        },
        {
          onSuccess: () => { reset(); onSave(); },
          successMessage: process ? 'Processo atualizado!' : 'Processo criado!',
          errorMessage: 'Erro ao salvar processo.',
          tenantId,
          entityType: 'LegalProcess',
          action: process ? 'update' : 'create'
        }
      );
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar processo. Tente novamente.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onCancel} title={process ? 'Editar Processo' : 'Novo Processo Judicial'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField 
            label="Cliente" 
            type="select" 
            name="client_id" 
            value={formData.client_id} 
            onChange={(v) => setFieldValue('client_id', v)} 
            options={clients.map(c => ({ value: c.id, label: c.company_name }))}
            error={errors.client_id}
            required
            disabled={clientsLoading}
          />
          <FormField label="Nº Processo" name="process_number" value={formData.process_number} onChange={handleChange} error={errors.process_number} required />
          <FormField label="Título" name="title" value={formData.title} onChange={handleChange} error={errors.title} required />
          <FormField label="Tribunal" name="court" value={formData.court} onChange={handleChange} />
          <FormField label="Juiz" name="judge" value={formData.judge} onChange={handleChange} />
          <FormField label="Tipo" type="select" name="process_type" value={formData.process_type} onChange={(v) => setFieldValue('process_type', v)} options={processTypeOptions} />
          <FormField label="Prioridade" type="select" name="priority" value={formData.priority} onChange={(v) => setFieldValue('priority', v)} options={priorityOptions} />
          <FormField label="Data de Protocolo" type="date" name="filing_date" value={formData.filing_date} onChange={handleChange} error={errors.filing_date} required />
          <FormField label="Próxima Audiência" type="date" name="next_hearing_date" value={formData.next_hearing_date} onChange={handleChange} />
          <FormField label="Advogado Responsável" name="responsible_lawyer" value={formData.responsible_lawyer} onChange={handleChange} />
          <FormField label="Status" type="select" name="status" value={formData.status} onChange={(v) => setFieldValue('status', v)} options={statusOptions} />
          <textarea 
            name="description"
            placeholder="Descrição do caso"
            value={formData.description}
            onChange={handleChange}
            className="col-span-2 p-2 border rounded text-sm"
            rows="3"
          />
          <textarea 
            name="notes"
            placeholder="Notas internas"
            value={formData.notes}
            onChange={handleChange}
            className="col-span-2 p-2 border rounded text-sm"
            rows="3"
          />
        </div>
        <FormActions onCancel={onCancel} onSubmit={handleSubmit} loading={loading || clientsLoading} submitLabel={process ? 'Atualizar' : 'Criar'} isDirty={isDirty} />
      </form>
    </ModalWrapper>
  );
}