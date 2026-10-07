import React from 'react';
import { useMultitenantAuth } from '@/components/auth/useMultitenantAuth';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

/**
 * Layout protegido para dashboard que enforce workspace isolation
 * Valida user_type + workspace_id antes de renderizar conteúdo
 */
export default function ProtectedDashboardLayout({ children, requiredType = 'internal' }) {
  const { user, loading, error, isInternal, isClient } = useMultitenantAuth(requiredType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Validando acesso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-semibold text-slate-900">Acesso Negado</h1>
          </div>
          <p className="text-slate-600 mb-6">{error}</p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = createPageUrl('Welcome')}
              className="flex-1"
            >
              Voltar ao Início
            </Button>
            {requiredType === 'client' && (
              <Button
                onClick={() => window.location.href = createPageUrl('ClientPortal')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Painel do Cliente
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User tem acesso válido - renderiza apenas o conteúdo (DashboardLayout é responsabilidade do Layout.js)
  return children;
}