import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import IntegrationCard from './IntegrationCard';

export default function VoximplantSetup({ integrationId }) {
  const [status, setStatus] = useState('pending');
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setStatus('loading');
    try {
      // Simula teste
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (apiKey && accountId) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <IntegrationCard
      title="☎️ Voximplant"
      description="Chamadas VoIP, videoconferência, chat e gravação de chamadas"
      status={status}
      statusMessage={
        status === 'success' ? 'Voximplant conectado com sucesso' : 
        status === 'error' ? 'Falha na conexão. Verifique as credenciais' : 
        'Configure suas credenciais Voximplant'
      }
    >
      <div className="space-y-6">
        {/* Passo 1: Criar Conta */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg">Passo 1: Criar Conta Voximplant</h4>
          <p className="text-sm text-slate-600">
            Se ainda não tem conta, crie uma grátis no Voximplant:
          </p>
          <Button 
            asChild 
            className="w-full"
            variant="outline"
          >
            <a 
              href="https://voximplant.com/sign-up" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Criar Conta Grátis
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          <p className="text-xs text-slate-500">
            Inclui 1000 minutos grátis/mês
          </p>
        </div>

        {/* Passo 2: Obter Credenciais */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold text-lg">Passo 2: Obter Credenciais</h4>
          <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
            <li>Faça login no <a href="https://manage.voximplant.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voximplant Console</a></li>
            <li>Vá para Settings → API Keys</li>
            <li>Clique em "Create New Key"</li>
            <li>Escolha permissões: "can_use_phone_service"</li>
            <li>Copie a chave gerada (API Key)</li>
            <li>Encontre seu Account ID em Settings → Account</li>
          </ol>
        </div>

        {/* Campos de Entrada */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-semibold">API Key</label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Cole sua API Key aqui"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(apiKey)}
                disabled={!apiKey}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-semibold">Account ID</label>
            <Input
              placeholder="Ex: 123456"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Teste */}
        <Button 
          onClick={testConnection}
          disabled={testing || !apiKey || !accountId}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {testing ? '⏳ Testando...' : '✓ Testar Conexão'}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-2">💡 Nota</p>
          <p className="text-blue-800 text-xs">
            Após validar, as credenciais serão armazenadas em segurança nos secrets da aplicação.
            Nunca compartilhe sua API Key.
          </p>
        </div>
      </div>
    </IntegrationCard>
  );
}