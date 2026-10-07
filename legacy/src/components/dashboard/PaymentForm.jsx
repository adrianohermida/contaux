/**
 * PaymentForm Component
 * Create and edit payments linked to invoices
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import ModalWrapper from '@/components/modals/ModalWrapper';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import { AlertCircle } from 'lucide-react';

const VALIDATION_RULES = {
  invoice_id: { required: 'Selecione uma fatura' },
  amount: { required: 'Informe o valor', pattern: /^\d+(\.\d{2})?$/ },
  payment_date: { required: 'Informe a data do pagamento' },
  payment_method: { required: 'Selecione o método de pagamento' },
};

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Transferência Bancária' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'check', label: 'Cheque' },
  { value: 'pix', label: 'PIX' },
  { value: 'other', label: 'Outro' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'failed', label: 'Falhou' },
  { value: 'refunded', label: 'Reembolsado' },
  { value: 'disputed', label: 'Em Disputa' },
];

export default function PaymentForm({
  payment = null,
  tenantId,
  isOpen = true,
  onSave,
  onCancel,
}) {
  const [formErrors, setFormErrors] = useState({});
  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(
    payment || {
      invoice_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      status: 'pending',
      transaction_id: '',
      notes: '',
      currency: 'BRL',
    }
  );

  const { errors, validateForm } = useFormValidation(VALIDATION_RULES);
  const { loading, submit, clearError } = useFormSubmit();

  // Fetch unpaid invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['unpaidInvoices', tenantId],
    queryFn: async () => {
      const allInvoices = await base44.entities.Invoice.filter({
        tenant_id: tenantId,
      });
      // Filter to unpaid invoices only
      return allInvoices.filter(inv => {
        const paid = inv.paid_amount || 0;
        const remaining = inv.total_amount - paid;
        return remaining > 0 && inv.status !== 'paid';
      });
    },
    enabled: !!tenantId && isOpen,
  });

  // Get selected invoice details
  const selectedInvoice = formData.invoice_id
    ? invoices.find(inv => inv.id === formData.invoice_id)
    : null;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow numeric input with decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleChange(e);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      setFormErrors(errors);
      return;
    }

    await submit(
      async () => {
        // Validate amount doesn't exceed remaining balance
        if (selectedInvoice) {
          const paid = selectedInvoice.paid_amount || 0;
          const remaining = selectedInvoice.total_amount - paid;
          if (parseFloat(formData.amount) > remaining) {
            throw new Error(
              `Valor máximo permitido: ${remaining.toFixed(2)} (saldo restante)`
            );
          }
        }

        if (payment?.id) {
          // Update
          await base44.entities.Payment.update(payment.id, formData);
        } else {
          // Create
          const client = invoices.find(inv => inv.id === formData.invoice_id)?.client_id;
          await base44.entities.Payment.create({
            ...formData,
            tenant_id: tenantId,
            client_id: client,
            amount: parseFloat(formData.amount),
          });
        }
      },
      {
        onSuccess: () => {
          onSave?.();
          reset();
        },
        tenantId,
        entityType: 'Payment',
      }
    );
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      title={payment ? 'Editar Pagamento' : 'Novo Pagamento'}
      onClose={onCancel}
      size="md"
    >
      <form className="space-y-4">
        {/* Invoice Selection */}
        <FormField
          label="Fatura"
          name="invoice_id"
          type="select"
          value={formData.invoice_id}
          onChange={(value) => {
            setFieldValue('invoice_id', value);
            // Auto-set currency from invoice
            const inv = invoices.find(i => i.id === value);
            if (inv) {
              setFieldValue('currency', inv.currency);
            }
          }}
          error={errors.invoice_id}
          required
          disabled={payment?.id} // Can't change invoice after creation
          options={invoices.map(inv => ({
            value: inv.id,
            label: `${inv.invoice_number} - ${inv.company_name || 'Sem cliente'} (R$ ${inv.total_amount.toFixed(2)})`,
          }))}
          placeholder="Selecione uma fatura"
        />

        {/* Invoice Details */}
        {selectedInvoice && (
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total da Fatura:</span>
              <span className="font-semibold dark:text-slate-200">
                {selectedInvoice.total_amount.toFixed(2)} {selectedInvoice.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Já Pago:</span>
              <span className="font-semibold dark:text-slate-200">
                {(selectedInvoice.paid_amount || 0).toFixed(2)} {selectedInvoice.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Saldo Restante:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {(selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0)).toFixed(2)}{' '}
                {selectedInvoice.currency}
              </span>
            </div>
          </div>
        )}

        {/* Amount */}
        <FormField
          label="Valor do Pagamento"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleAmountChange}
          error={errors.amount}
          required
          placeholder="0.00"
          step="0.01"
          max={
            selectedInvoice
              ? (selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0)).toString()
              : undefined
          }
        />

        {/* Payment Date */}
        <FormField
          label="Data do Pagamento"
          name="payment_date"
          type="date"
          value={formData.payment_date}
          onChange={handleChange}
          error={errors.payment_date}
          required
        />

        {/* Payment Method */}
        <FormField
          label="Método de Pagamento"
          name="payment_method"
          type="select"
          value={formData.payment_method}
          onChange={(value) => setFieldValue('payment_method', value)}
          error={errors.payment_method}
          required
          options={PAYMENT_METHODS}
        />

        {/* Status */}
        <FormField
          label="Status do Pagamento"
          name="status"
          type="select"
          value={formData.status}
          onChange={(value) => setFieldValue('status', value)}
          options={PAYMENT_STATUSES}
        />

        {/* Transaction ID */}
        <FormField
          label="ID da Transação (Banco/Gateway)"
          name="transaction_id"
          type="text"
          value={formData.transaction_id}
          onChange={handleChange}
          placeholder="Ex: TRX-12345678"
        />

        {/* Currency (Read-only) */}
        <FormField
          label="Moeda"
          name="currency"
          type="select"
          value={formData.currency}
          onChange={(value) => setFieldValue('currency', value)}
          options={[
            { value: 'BRL', label: 'BRL - Real' },
            { value: 'USD', label: 'USD - Dólar' },
            { value: 'EUR', label: 'EUR - Euro' },
            { value: 'GBP', label: 'GBP - Libra' },
            { value: 'CAD', label: 'CAD - Dólar Canadense' },
            { value: 'AUD', label: 'AUD - Dólar Australiano' },
          ]}
          disabled={!!selectedInvoice} // Auto from invoice
        />

        {/* Notes */}
        <FormField
          label="Observações"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Adicione notas sobre o pagamento"
          rows={3}
        />

        {/* Error Display */}
        {Object.keys(formErrors).length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {Object.entries(formErrors)
                .map(([key, msg]) => msg)
                .join(', ')}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          isDirty={isDirty || !!payment}
          loading={loading}
          submitLabel={payment ? 'Atualizar Pagamento' : 'Registrar Pagamento'}
        />
      </form>
    </ModalWrapper>
  );
}