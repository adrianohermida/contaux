import React, { useState } from 'react';
import { ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntegrationCard from './IntegrationCard';

export default function GoogleCalendarSetup({ integrationId }) {
  const [status, setStatus] = useState('pending');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus('loading');
    try {
      // Em produção, chamaria request_oauth_authorization
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
      title="📅 Google Calendar"
      description="Sincronize prazos, reuniões e eventos de clientes com Google Calendar"
      status={status}
      statusMessage={
        status === 'success' ? 'Google Calendar conectado com sucesso' : 
        status === 'error' ? 'Erro ao conectar com Google Calendar' : 
        'Autorize acesso ao Google Calendar'
      }
    >
      <div className="space-y-6">
        {/* O que você pode fazer */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Funcionalidades
          </h4>
          <ul className="text-sm text-slate-700 space-y-2 ml-6 list-disc">
            <li><strong>Sincronize prazos de faturas:</strong> Datas de vencimento aparecem no seu Calendar</li>
            <li><strong>Prazos legais:</strong> Datas importantes de processos em andamento</li>
            <li><strong>Reuniões com clientes:</strong> Crie e organize reuniões diretamente</li>
            <li><strong>Lembretes:</strong> Notificações automáticas de tarefas pendentes</li>
            <li><strong>Compartilhamento:</strong> Compartilhe eventos com sua equipe</li>
          </ul>
        </div>

        {/* Instruções */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg">Passo a Passo</h4>
          <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
            <li>Clique em "Autorizar com Google" abaixo</li>
            <li>Faça login com sua conta Google (ou do Google Workspace)</li>
            <li>Autorize acesso ao Google Calendar</li>
            <li>Selecione qual calendário sincronizar</li>
            <li>Pronto! Os eventos aparecerão automaticamente</li>
          </ol>
        </div>

        {/* Botão de Autorização */}
        <Button 
          onClick={testConnection}
          disabled={testing}
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="w-4 h-4" />
          {testing ? '⏳ Conectando...' : '🔗 Autorizar com Google'}
        </Button>

        {/* Configuração Manual */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg">Configuração Avançada</h4>
          <p className="text-sm text-slate-600">
            Se preferir configurar manualmente, você pode:
          </p>
          <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
            <li>Acesse <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Calendar</a></li>
            <li>Crie um novo calendário chamado "Contaux Financeiro"</li>
            <li>Copie o ID do calendário em Configurações</li>
            <li>Cole o ID nas configurações de sincronização abaixo</li>
          </ol>
        </div>

        {/* Notas de Segurança */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">🔒 Segurança</p>
              <p className="text-amber-800 text-xs mt-1">
                A Contaux usa OAuth seguro do Google. Seus dados de calendário permanecem privados e não são armazenados nos nossos servidores.
              </p>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-green-900 mb-2">💡 Dicas</p>
          <ul className="text-green-800 text-xs space-y-1 list-disc ml-5">
            <li>Use calendários diferentes para cada cliente se necessário</li>
            <li>Ative notificações para não perder prazos importantes</li>
            <li>Compartilhe calendários com sua equipe para melhor coordenação</li>
            <li>Integre com outras ferramentas via Google Calendar (Slack, Teams, etc)</li>
          </ul>
        </div>
      </div>
    </IntegrationCard>
  );
}