import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/**
 * Hook para gerenciar submissão de formulários
 * Padroniza loading, erros, validação de tenant e auditoria
 */
export function useFormSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (
    onSubmit,
    { 
      onSuccess,
      onError,
      successMessage = 'Operação realizada com sucesso!',
      errorMessage = 'Erro ao processar. Tente novamente.',
      tenantId = null,
      entityType = null,
      action = 'update'
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Validação de tenant (frontend)
      if (tenantId) {
        const user = await base44.auth.me();
        const userTenantId = user.tenant_id || user.email.split('@')[0];
        
        if (tenantId !== userTenantId) {
          throw new Error('Acesso negado: tenant inválido');
        }
      }

      await onSubmit();
      
      // Log de sucesso
      if (tenantId && entityType) {
        logAudit(action, entityType, tenantId);
      }
      
      toast.success(successMessage);
      onSuccess?.();
    } catch (err) {
      const message = err.message || errorMessage;
      setError(message);
      toast.error(message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, submit, clearError };
}

async function logAudit(action, entityType, tenantId) {
  try {
    const user = await base44.auth.me();
    await base44.entities.AuditLog.create({
      tenant_id: tenantId,
      user_email: user.email,
      action,
      entity_type: entityType,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}