import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import { useTheme } from '@/components/hooks/useTheme';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';

export default function UserPreferences({ user, tenantId, isOpen = true, onClose, onSave }) {
  const { theme, toggleTheme, language, setLanguage } = useTheme();

  const initialData = useMemo(() => ({
    notify_invoice_overdue: user?.notify_invoice_overdue ?? true,
    notify_invoice_due_soon: user?.notify_invoice_due_soon ?? true,
    notify_payment_received: user?.notify_payment_received ?? true,
    notify_ticket_update: user?.notify_ticket_update ?? true,
    notify_legal_update: user?.notify_legal_update ?? true,
    notification_method_email: user?.notification_method_email ?? true,
    notification_method_in_app: user?.notification_method_in_app ?? true
  }), [user]);

  const { formData, setFieldValue, isDirty, reset } = useFormState(initialData);
  const { submit } = useFormSubmit();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await submit(
      async () => {
        await base44.auth.updateMe(formData);
      },
      {
        onSuccess: () => { reset(); onSave?.(); },
        successMessage: 'Preferências salvas com sucesso!',
        errorMessage: 'Erro ao salvar preferências.',
        tenantId,
        action: 'update'
      }
    );
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Preferências" size="md">
      <form onSubmit={handleSubmit} className="space-y-6 dark:text-slate-200">
         {/* Tema */}
         <div className="space-y-3 border-b border-slate-200 dark:border-slate-600 pb-4">
           <h3 className="font-semibold text-slate-900 dark:text-slate-200">Aparência</h3>
           <div className="flex items-center justify-between">
             <span className="text-sm text-slate-700 dark:text-slate-300">Tema Escuro</span>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Idioma */}
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-600 pb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-200">Idioma</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-600 pb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-200">Tipos de Notificação</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_invoice_overdue}
              onChange={(e) => setFieldValue('notify_invoice_overdue', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Faturas vencidas</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_invoice_due_soon}
              onChange={(e) => setFieldValue('notify_invoice_due_soon', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Faturas próximas do vencimento</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_payment_received}
              onChange={(e) => setFieldValue('notify_payment_received', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Pagamentos recebidos</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_ticket_update}
              onChange={(e) => setFieldValue('notify_ticket_update', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Atualizações de tickets</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_legal_update}
              onChange={(e) => setFieldValue('notify_legal_update', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Atualizações de processos legais</span>
          </label>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-200">Método de Notificação</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notification_method_email}
              onChange={(e) => setFieldValue('notification_method_email', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Receber por email</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notification_method_in_app}
              onChange={(e) => setFieldValue('notification_method_in_app', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Notificações no app</span>
          </label>
        </div>

        <FormActions onCancel={onClose} onSubmit={handleSubmit} submitLabel="Salvar Preferências" isDirty={isDirty} />
      </form>
    </ModalWrapper>
  );
}