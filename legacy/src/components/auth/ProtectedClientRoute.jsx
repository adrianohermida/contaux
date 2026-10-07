import React from 'react';
import { useMultitenantAuth } from './useMultitenantAuth';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Proteção para rotas do cliente (MeuPainel)
 * Apenas usuários com user_type='client' têm acesso
 */
export default function ProtectedClientRoute({ children }) {
  const { user, loading, error, hasAccess, isClient } = useMultitenantAuth('client');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !isClient()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h1>
          <p className="text-red-800 mb-4">
            {error || 'Você não tem permissão para acessar esta área. Acesso restrito a clientes.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return children;
}