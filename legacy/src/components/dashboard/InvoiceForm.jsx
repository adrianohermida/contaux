import React, { useMemo, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

const VALIDATION_RULES = {
  invoice_number: { label: 'Nº Fatura', required: true },
  due_date: { label: 'Data de Vencimento', required: true }
};

export default function InvoiceForm({ invoice, onSave, onCancel, tenantId, isOpen = true }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const initialData = useMemo(() => invoice || {
    tenant_id: tenantId,
    client_id: '',
    invoice_number: '',
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_amount: 0,
    tax_amount: 0,
    paid_amount: 0,
    currency: 'BRL',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
    notes: ''
  }, [invoice, tenantId]);

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(initialData);
  const { errors, validateForm, clearErrors } = useFormValidation();
  const { loading, submit } = useFormSubmit();

  // Carregar clientes ao abrir o formulário
  useEffect(() => {
    if (!isOpen || !tenantId) return;
    
    const loadClients = async () => {
      setLoadingClients(true);
      try {
        const data = await base44.entities.Client.filter({ 
          tenant_id: tenantId,
          status: 'active'
        });
        setClients(data || []);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, [isOpen, tenantId]);

  const statusOptions = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'sent', label: 'Enviada' },
    { value: 'paid', label: 'Paga' },
    { value: 'overdue', label: 'Vencida' }
  ];

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'unit_price' || field === 'tax_rate' ? parseFloat(value) || 0 : value
    };
    setFieldValue('items', newItems);
  };

  const validateInvoice = () => {
    const newErrors = {};

    // Validar cliente
    if (!formData.client_id || formData.client_id.trim() === '') {
      newErrors.client_id = 'Selecione um cliente';
    }

    // Validar datas
    if (new Date(formData.due_date) <= new Date(formData.issue_date)) {
      newErrors.due_date = 'Data de vencimento deve ser posterior à emissão';
    }

    // Validar items
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item';
    } else if (formData.items.every(item => !item.description || item.unit_price === 0)) {
      newErrors.items = 'Todos os items devem ter descrição e preço';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(formData, VALIDATION_RULES)) return;
    if (!validateInvoice()) return;

    // Calcular totais automaticamente
    const totalAmount = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemTax = itemTotal * (item.tax_rate || 0) / 100;
      return sum + itemTotal + itemTax;
    }, 0);

    const taxAmount = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + (itemTotal * (item.tax_rate || 0) / 100);
    }, 0);

    const updatedFormData = {
      ...formData,
      total_amount: Math.round(totalAmount * 100) / 100,
      tax_amount: Math.round(taxAmount * 100) / 100,
      tenant_id: tenantId
    };

    await submit(
      async () => {
        if (invoice?.id) {
          await base44.entities.Invoice.update(invoice.id, updatedFormData);
        } else {
          await base44.entities.Invoice.create(updatedFormData);
        }
      },
      {
        onSuccess: () => { reset(); onSave(); },
        successMessage: invoice ? 'Fatura atualizada!' : 'Fatura criada!',
        errorMessage: 'Erro ao salvar fatura. Tente novamente.',
        tenantId,
        entityType: 'Invoice',
        action: invoice ? 'update' : 'create'
      }
    );
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onCancel} title={invoice ? 'Editar Fatura' : 'Nova Fatura'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 rounded-lg" role="form" aria-label={invoice ? 'Formulário de edição de fatura' : 'Formulário de nova fatura'}>
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-200">Erros na validação:</h4>
              <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                {Object.entries(validationErrors).map(([key, msg]) => (
                  <li key={key}>• {msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField 
              label="Cliente" 
              type="select"
              name="client_id" 
              value={formData.client_id} 
              onChange={(v) => setFieldValue('client_id', v)}
              options={clients.map(c => ({ value: c.id, label: c.company_name }))}
              required 
              aria-label="Selecionar cliente"
              disabled={loadingClients}
            />
            <FormField label="Nº Fatura" name="invoice_number" value={formData.invoice_number} onChange={handleChange} error={errors.invoice_number} required aria-label="Número da fatura" />
            <FormField label="Data Emissão" type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} required aria-label="Data de emissão da fatura" />
            <FormField label="Data Vencimento" type="date" name="due_date" value={formData.due_date} onChange={handleChange} error={errors.due_date} required aria-label="Data de vencimento da fatura" />
            <FormField label="Status" type="select" name="status" value={formData.status} onChange={(v) => setFieldValue('status', v)} options={statusOptions} aria-label="Status da fatura" />
            <FormField label="Moeda" type="select" name="currency" value={formData.currency} onChange={(v) => setFieldValue('currency', v)} options={[{ value: 'BRL', label: 'Real (BRL)' }, { value: 'USD', label: 'Dólar (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }]} aria-label="Moeda da fatura" />
          </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-2 bg-slate-50 dark:bg-slate-700/30">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Itens da Fatura</h3>
          {formData.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <Input placeholder="Descrição" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} aria-label={`Descrição do item ${idx + 1}`} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              <Input placeholder="Qtd" type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} aria-label={`Quantidade do item ${idx + 1}`} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              <Input placeholder="Preço" type="number" step="0.01" value={item.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)} aria-label={`Preço unitário do item ${idx + 1}`} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              <Input placeholder="Imposto %" type="number" step="0.01" value={item.tax_rate} onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)} aria-label={`Taxa de imposto do item ${idx + 1}`} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              <Button variant="ghost" size="icon" onClick={() => setFieldValue('items', formData.items.filter((_, i) => i !== idx))} aria-label={`Remover item ${idx + 1}`} className="dark:hover:bg-slate-600">
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setFieldValue('items', [...formData.items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }])} className="mt-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700" aria-label="Adicionar novo item à fatura">
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Adicionar Item
          </Button>
        </div>

        <FormField label="Notas" type="textarea" name="notes" value={formData.notes} onChange={handleChange} rows={2} aria-label="Notas da fatura" />
        <FormActions onCancel={onCancel} onSubmit={handleSubmit} loading={loading} submitLabel={invoice ? 'Atualizar' : 'Criar'} isDirty={isDirty} />
      </form>
    </ModalWrapper>
  );
}