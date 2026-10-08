/**
 * QuoteForm Component
 * Create/Edit quotes with line items, calculations, and status management
 */

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import ModalWrapper from '@/components/modals/ModalWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Copy } from 'lucide-react';

const VALIDATION_RULES = {
  quote_date: { required: 'Data da cotação é obrigatória' },
  valid_until: { required: 'Data de validade é obrigatória' },
  currency: { required: 'Moeda é obrigatória' },
};

const STATUSES = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'sent', label: 'Enviado' },
  { value: 'accepted', label: 'Aceito' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'converted', label: 'Convertido' },
  { value: 'expired', label: 'Expirado' },
];

const CURRENCIES = [
  { value: 'BRL', label: 'Real (BRL)' },
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'Libra (GBP)' },
  { value: 'CAD', label: 'Dólar Canadense (CAD)' },
  { value: 'AUD', label: 'Dólar Australiano (AUD)' },
];

export default function QuoteForm({ quote, tenantId, onSave, onCancel, isOpen = true }) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(quote?.items || []);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 0,
  });

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(
    quote || {
      tenant_id: tenantId,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: '',
      status: 'draft',
      currency: 'BRL',
      discount_percent: 0,
      tax_percent: 0,
      notes: '',
      terms: '',
    }
  );

  const { errors, validateForm, clearErrors } = useFormValidation(VALIDATION_RULES);
  const { loading, submit, error: submitError } = useFormSubmit();

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', tenantId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: tenantId }, '-updated_date', 100),
    enabled: !!tenantId,
  });

  // Calculate totals whenever items or discount/tax change
  const recalculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price || 0), 0);
    const discountAmount = formData.discount_percent > 0 
      ? (subtotal * formData.discount_percent) / 100 
      : formData.discount_amount || 0;
    const taxBase = subtotal - discountAmount;
    const taxAmount = formData.tax_percent > 0 
      ? (taxBase * formData.tax_percent) / 100 
      : formData.tax_amount || 0;
    const totalAmount = taxBase + taxAmount;

    setCalculations({
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    });
  }, [items, formData.discount_percent, formData.discount_amount, formData.tax_percent, formData.tax_amount]);

  React.useEffect(() => {
    recalculateTotals();
  }, [recalculateTotals]);

  // Add item
  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
    };
    setItems([...items, newItem]);
  };

  // Update item
  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.subtotal = (updated.quantity || 0) * (updated.unit_price || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  // Remove item
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Validate and submit
  const handleSubmit = async () => {
    clearErrors();
    if (!validateForm(formData)) {
      return;
    }

    if (items.length === 0) {
      alert('Adicione pelo menos um item à cotação');
      return;
    }

    const submitData = {
      ...formData,
      items,
      subtotal: calculations.subtotal,
      discount_amount: calculations.discount_amount,
      tax_amount: calculations.tax_amount,
      total_amount: calculations.total_amount,
    };

    await submit(
      async () => {
        if (quote?.id) {
          await base44.entities.Quote.update(quote.id, submitData);
        } else {
          await base44.entities.Quote.create(submitData);
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['quotes', tenantId] });
          reset();
          setItems([]);
          onSave?.();
        },
      }
    );
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      title={quote ? 'Editar Cotação' : 'Nova Cotação'}
      onClose={onCancel}
      size="lg"
    >
      <form className="space-y-6 dark:bg-slate-900">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Informações Gerais</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Cliente"
              name="client_id"
              type="select"
              value={formData.client_id}
              onChange={(value) => setFieldValue('client_id', value)}
              options={clients.map(c => ({
                value: c.id,
                label: c.company_name
              }))}
              required
              error={errors.client_id}
            />

            <FormField
              label="Oportunidade"
              name="opportunity_id"
              type="select"
              value={formData.opportunity_id || ''}
              onChange={(value) => setFieldValue('opportunity_id', value)}
              options={[{ value: '', label: 'Nenhuma' }]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Data da Cotação"
              name="quote_date"
              type="date"
              value={formData.quote_date}
              onChange={handleChange}
              required
              error={errors.quote_date}
            />

            <FormField
              label="Válida Até"
              name="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={handleChange}
              required
              error={errors.valid_until}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Moeda"
              name="currency"
              type="select"
              value={formData.currency}
              onChange={(value) => setFieldValue('currency', value)}
              options={CURRENCIES}
              required
            />

            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={(value) => setFieldValue('status', value)}
              options={STATUSES}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Itens da Cotação</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              className="gap-2 dark:border-slate-600 dark:text-slate-300"
            >
              <Plus className="w-4 h-4" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                <Input
                  placeholder="Descrição"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="col-span-4 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Qtd"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                  className="col-span-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Valor"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value))}
                  className="col-span-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-slate-300">
                    {(item.subtotal || 0).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations */}
        <div className="space-y-3 p-4 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="flex justify-between text-sm">
            <span className="dark:text-slate-400">Subtotal:</span>
            <span className="font-medium dark:text-slate-200">{calculations.subtotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Desconto %"
              name="discount_percent"
              type="number"
              value={formData.discount_percent}
              onChange={handleChange}
              min="0"
              max="100"
            />
            <FormField
              label="Imposto %"
              name="tax_percent"
              type="number"
              value={formData.tax_percent}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-slate-300 dark:border-slate-600">
            <span className="dark:text-slate-400">Desconto:</span>
            <span className="dark:text-slate-200">-{calculations.discount_amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="dark:text-slate-400">Imposto:</span>
            <span className="dark:text-slate-200">+{calculations.tax_amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-300 dark:border-slate-600">
            <span className="dark:text-slate-200">Total:</span>
            <span className="dark:text-slate-100">{calculations.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="space-y-4">
          <FormField
            label="Notas Internas"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />

          <FormField
            label="Termos e Condições"
            name="terms"
            type="textarea"
            value={formData.terms}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {submitError && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
            {submitError}
          </div>
        )}

        <FormActions
          onCancel={onCancel}
          onSubmit={handleSubmit}
          isDirty={isDirty || items.length > 0}
          loading={loading}
        />
      </form>
    </ModalWrapper>
  );
}