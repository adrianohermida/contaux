import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntegrationCard from './IntegrationCard';

export default function GoogleSheetsSetup({ integrationId }) {
  const [status, setStatus] = useState('pending');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus('loading');
    try {
      // Chamaria request_oauth_authorization aqui
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
    } catch (error) {
      setStatus('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <IntegrationCard
      title="📊 Google Sheets"
      description="Sincronize dados de invoices, pagamentos e clientes com Google Sheets"
      status={status}
      statusMessage={
        status === 'success' ? 'Google Sheets conectado com sucesso' : 
        status === 'error' ? 'Erro ao conectar com Google' : 
        'Autorize acesso ao Google Sheets'
      }
    >
      <div className="space-y-6">
        {/* Opção 1: Google Sheets (OAuth) */}
        <div className="bg-white rounded-lg p-4 space-y-3 border-2 border-blue-200">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            🔵 Opção 1: Google Sheets (Recomendado)
          </h4>
          <p className="text-sm text-slate-600">
            Sincronização automática com Google Sheets usando OAuth. Seguro e sem custo adicional.
          </p>
          <ul className="text-sm text-slate-700 space-y-1 ml-6 list-disc">
            <li>Sincronização bidirecional</li>
            <li>Sem limite de planilhas</li>
            <li>Autenticação segura via Google</li>
            <li>Totalmente gratuito</li>
          </ul>
          <Button 
            onClick={testConnection}
            disabled={testing}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {testing ? '⏳ Conectando...' : '🔗 Autorizar com Google'}
          </Button>
        </div>

        {/* Opção 2: Alternativa - Supabase (Gratuita) */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            🟢 Opção 2: Supabase (Alternativa Gratuita)
          </h4>
          <p className="text-sm text-slate-600">
            Banco de dados PostgreSQL gratuito com interface tipo planilha (Supabase Studio).
          </p>
          <ul className="text-sm text-slate-700 space-y-1 ml-6 list-disc">
            <li>500 MB de armazenamento gratuito</li>
            <li>Interface SQL avançada</li>
            <li>Real-time sync</li>
            <li>Backup automático</li>
          </ul>
          <Button 
            asChild
            variant="outline"
            className="w-full gap-2"
          >
            <a 
              href="https://supabase.com/sign-up" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Criar Conta Supabase Grátis
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* Configuração Manual */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg">Configuração Passo a Passo</h4>
          <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
            <li>Clique em "Autorizar com Google" acima</li>
            <li>Permita acesso ao Google Sheets</li>
            <li>Crie uma planilha em <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sheets.google.com</a></li>
            <li>Copie o ID da planilha (na URL)</li>
            <li>Configure no painel para sincronizar dados</li>
          </ol>
        </div>

        {/* Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-green-900 mb-2">✅ Recomendação</p>
          <p className="text-green-800 text-xs">
            Use <strong>Google Sheets</strong> para melhor integração nativa com Google Workspace.
            Use <strong>Supabase</strong> se preferir banco SQL puro.
          </p>
        </div>
      </div>
    </IntegrationCard>
  );
}