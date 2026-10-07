import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * FormActions - Botões padrão para salvar/cancelar
 * ✅ Dark mode, keyboard accessible, aria labels
 */
export default function FormActions({
  onCancel,
  onSubmit,
  loading = false,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isDirty = true,
  submitVariant = 'default'
}) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
        aria-label={cancelLabel}
        className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={loading || !isDirty}
        className={submitVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600' : ''}
        aria-label={loading ? `${submitLabel}...` : submitLabel}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            {submitLabel}...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}