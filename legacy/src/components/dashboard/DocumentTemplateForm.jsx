import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';

const VALIDATION_RULES = {
  template_name: { label: 'Nome do Modelo', required: true, minLength: 2 },
  content: { label: 'Conteúdo Principal', required: true, minLength: 10 }
};

export default function DocumentTemplateForm({ tenantId, userId, onSuccess, onClose, editingTemplate, isOpen = true }) {
  const initialData = useMemo(() => ({
    template_name: editingTemplate?.template_name || '',
    template_type: editingTemplate?.template_type || 'invoice',
    description: editingTemplate?.description || '',
    content: editingTemplate?.content || '',
    header: editingTemplate?.header || '',
    footer: editingTemplate?.footer || '',
    is_default: editingTemplate?.is_default || false,
    status: editingTemplate?.status || 'active'
  }), [editingTemplate]);

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(initialData);
  const { errors, validateForm, clearErrors } = useFormValidation();
  const { loading, submit } = useFormSubmit();

  const templateTypeOptions = [
    { value: 'invoice', label: 'Fatura' },
    { value: 'quote', label: 'Orçamento' },
    { value: 'statement', label: 'Extrato' },
    { value: 'contract', label: 'Contrato' },
    { value: 'report', label: 'Relatório' },
    { value: 'letter', label: 'Carta' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'archived', label: 'Arquivado' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(formData, VALIDATION_RULES)) return;

    await submit(
      async () => {
        const templateData = { ...formData, tenant_id: tenantId, created_by: userId, last_modified_by: userId };
        if (editingTemplate?.id) {
          await base44.entities.DocumentTemplate.update(editingTemplate.id, templateData);
        } else {
          await base44.entities.DocumentTemplate.create(templateData);
        }
      },
      {
        onSuccess: () => { reset(); onSuccess(); },
        successMessage: editingTemplate ? 'Modelo atualizado!' : 'Modelo criado!',
        errorMessage: 'Erro ao salvar modelo.',
        tenantId,
        entityType: 'DocumentTemplate',
        action: editingTemplate ? 'update' : 'create'
      }
    );
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={editingTemplate ? 'Editar Modelo' : 'Novo Modelo de Documento'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nome do Modelo" name="template_name" value={formData.template_name} onChange={handleChange} error={errors.template_name} placeholder="Ex: Fatura Padrão" required />
          <FormField label="Tipo de Documento" type="select" name="template_type" value={formData.template_type} onChange={(v) => setFieldValue('template_type', v)} options={templateTypeOptions} />
        </div>

        <FormField label="Descrição" name="description" value={formData.description} onChange={handleChange} placeholder="Descrição do modelo..." />

        <FormField label="Cabeçalho (Header)" type="textarea" name="header" value={formData.header} onChange={handleChange} placeholder="HTML/Markdown para o cabeçalho..." rows={2} />
        <FormField label="Conteúdo Principal" type="textarea" name="content" value={formData.content} onChange={handleChange} error={errors.content} placeholder="HTML/Markdown. Use {{variável}} para placeholders..." rows={4} required />
        <FormField label="Rodapé (Footer)" type="textarea" name="footer" value={formData.footer} onChange={handleChange} placeholder="HTML/Markdown para o rodapé..." rows={2} />

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <FormField label="Status" type="select" name="status" value={formData.status} onChange={(v) => setFieldValue('status', v)} options={statusOptions} />
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_default} onChange={(e) => setFieldValue('is_default', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium text-slate-700">Definir como padrão</span>
            </label>
          </div>
        </div>

        <FormActions onCancel={onClose} onSubmit={handleSubmit} loading={loading} submitLabel={editingTemplate ? 'Atualizar' : 'Criar'} isDirty={isDirty} />
      </form>
    </ModalWrapper>
  );
}