import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function IntegrationCard({ 
  title, 
  description, 
  status = 'pending', 
  statusMessage,
  children 
}) {
  const statusConfig = {
    success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    loading: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    pending: { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-6 space-y-6`}>
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span className={`text-xs font-semibold ${config.color}`}>
              {status === 'success' && 'Ativo'}
              {status === 'error' && 'Erro'}
              {status === 'warning' && 'Aviso'}
              {status === 'loading' && 'Configurando...'}
              {status === 'pending' && 'Pendente'}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        {statusMessage && (
          <p className={`text-sm mt-2 ${status === 'error' ? 'text-red-700' : 'text-slate-700'}`}>
            {statusMessage}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}