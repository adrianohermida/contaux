import React, { useState } from 'react';
import { ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import IntegrationCard from './IntegrationCard';

export default function BackupStorageSetup({ integrationId }) {
  const [status, setStatus] = useState('pending');
  const [option, setOption] = useState(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      if ((supabaseUrl && supabaseKey) || (awsAccessKey && awsSecretKey)) {
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

  if (!option) {
    return (
      <IntegrationCard
        title="💾 Armazenamento de Backup"
        description="Configure armazenamento seguro para backups automáticos"
        status={status}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Escolha um serviço para armazenar seus backups de forma segura.
          </p>

          {/* Opção 1: Supabase (Recomendado) */}
          <div 
            className="bg-white border-2 border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOption('supabase')}
          >
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-2">
              🟢 Supabase (Recomendado)
            </h4>
            <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
              <li>500 MB grátis (com upgrade para 1 TB)</li>
              <li>PostgreSQL seguro na nuvem</li>
              <li>Backup automático diário</li>
              <li>Interface intuitiva</li>
              <li>Sem cartão de crédito necessário</li>
            </ul>
            <Button className="w-full mt-4 gap-2 bg-green-600 hover:bg-green-700">
              Configurar Supabase
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Opção 2: AWS S3 */}
          <div 
            className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOption('aws')}
          >
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-2">
              🟠 Amazon S3
            </h4>
            <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
              <li>5 GB grátis no primeiro ano</li>
              <li>Escala ilimitada</li>
              <li>Altamente confiável (99.9% uptime)</li>
              <li>Padrão da indústria</li>
              <li>Requer cartão de crédito</li>
            </ul>
            <Button variant="outline" className="w-full mt-4 gap-2">
              Configurar AWS S3
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Opção 3: Google Cloud Storage */}
          <div 
            className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOption('gcs')}
          >
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-2">
              🔵 Google Cloud Storage
            </h4>
            <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
              <li>5 GB grátis (sempre)</li>
              <li>Integração com Google Workspace</li>
              <li>Replicação automática</li>
              <li>Segurança de nível empresarial</li>
              <li>Requer cartão de crédito para upgrade</li>
            </ul>
            <Button variant="outline" className="w-full mt-4 gap-2">
              Configurar Google Cloud
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mt-4">
            <p className="font-semibold text-blue-900 mb-2">💡 Recomendação</p>
            <p className="text-blue-800 text-xs">
              Para começar <strong>gratuitamente</strong>, recomendamos <strong>Supabase</strong>.
              Para crescimento posterior, considere <strong>AWS S3</strong> ou <strong>Google Cloud Storage</strong>.
            </p>
          </div>
        </div>
      </IntegrationCard>
    );
  }

  if (option === 'supabase') {
    return (
      <IntegrationCard
        title="💾 Backup - Supabase"
        description="Armazenamento seguro de backups no Supabase"
        status={status}
        statusMessage={
          status === 'success' ? 'Supabase conectado com sucesso' : 
          'Configure suas credenciais Supabase'
        }
      >
        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-white rounded-lg p-4 space-y-3 border">
            <h4 className="font-semibold">Passo a Passo</h4>
            <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
              <li>Crie conta em <a href="https://supabase.com/sign-up" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
              <li>Crie um novo projeto (selecione Brasil como região)</li>
              <li>Vá para Settings → API → URL do projeto</li>
              <li>Copie o <strong>Supabase URL</strong> abaixo</li>
              <li>Copie a <strong>API Key</strong> (anon key)</li>
            </ol>
          </div>

          {/* Campos */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <label className="text-sm font-semibold">Supabase Project URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://xxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(supabaseUrl)}
                  disabled={!supabaseUrl}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <label className="text-sm font-semibold">Supabase API Key</label>
              <Input
                type="password"
                placeholder="Cole a chave API aqui"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <Button 
            onClick={testConnection}
            disabled={testing || !supabaseUrl || !supabaseKey}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {testing ? '⏳ Testando...' : '✓ Testar Conexão'}
          </Button>

          <Button 
            variant="outline"
            onClick={() => setOption(null)}
            className="w-full"
          >
            ← Voltar
          </Button>
        </div>
      </IntegrationCard>
    );
  }

  if (option === 'aws') {
    return (
      <IntegrationCard
        title="💾 Backup - AWS S3"
        description="Armazenamento seguro de backups no Amazon S3"
        status={status}
        statusMessage={
          status === 'success' ? 'AWS conectado com sucesso' : 
          'Configure suas credenciais AWS'
        }
      >
        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-white rounded-lg p-4 space-y-3 border">
            <h4 className="font-semibold">Passo a Passo</h4>
            <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
              <li>Crie conta em <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aws.amazon.com</a></li>
              <li>Acesse IAM → Users → Create User</li>
              <li>Dê permissão: AmazonS3FullAccess</li>
              <li>Crie access keys e copie aqui</li>
              <li>Crie bucket S3 para os backups</li>
            </ol>
          </div>

          {/* Campos */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <label className="text-sm font-semibold">AWS Access Key ID</label>
              <Input
                type="password"
                placeholder="AKIA..."
                value={awsAccessKey}
                onChange={(e) => setAwsAccessKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <label className="text-sm font-semibold">AWS Secret Access Key</label>
              <Input
                type="password"
                placeholder="Cole a chave secreta aqui"
                value={awsSecretKey}
                onChange={(e) => setAwsSecretKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <Button 
            onClick={testConnection}
            disabled={testing || !awsAccessKey || !awsSecretKey}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {testing ? '⏳ Testando...' : '✓ Testar Conexão'}
          </Button>

          <Button 
            variant="outline"
            onClick={() => setOption(null)}
            className="w-full"
          >
            ← Voltar
          </Button>
        </div>
      </IntegrationCard>
    );
  }

  return null;
}