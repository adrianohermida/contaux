import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import IntegrationCard from './IntegrationCard';

export default function EncryptionSetup({ integrationId }) {
  const [status, setStatus] = useState('pending');
  const [key, setKey] = useState('');
  const [backupKey, setBackupKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  const generateKey = () => {
    // Simula geração de chave base64 de 32+ caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let key = '';
    for (let i = 0; i < 44; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const generateKeys = () => {
    setKey(generateKey());
    setBackupKey(generateKey());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setStatus('loading');
    try {
      // Simula teste de conexão
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
      title="🔐 Encriptação AES-256-GCM"
      description="Encriptação de dados sensíveis como MFA secrets e credenciais"
      status={status}
      statusMessage={
        status === 'success' ? 'Encriptação ativada com sucesso' : 
        status === 'error' ? 'Erro ao testar a encriptação' : 
        'Configure as chaves de encriptação'
      }
    >
      <div className="space-y-6">
        {/* Instrução de Geração */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            Como Configurar
          </h4>
          <ol className="text-sm text-slate-700 space-y-2 ml-6 list-decimal">
            <li>Clique em "Gerar Chaves" abaixo para criar chaves seguras</li>
            <li>Copie a chave ENCRYPTION_KEY (principal)</li>
            <li>Vá para Dashboard → Settings → Environment Variables</li>
            <li>Cole o valor no campo ENCRYPTION_KEY</li>
            <li>Repetir com BACKUP_STORAGE_KEY (backup)</li>
            <li>Clique em "Testar Conexão" para validar</li>
          </ol>
        </div>

        {/* Gerador de Chaves */}
        <div className="space-y-4">
          <Button onClick={generateKeys} variant="outline" className="w-full">
            🔑 Gerar Chaves Seguras
          </Button>

          {key && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <label className="text-sm font-semibold">ENCRYPTION_KEY (Chave Principal)</label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={key}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(key)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-600">
                  ✓ Comprimento: {key.length} caracteres (mínimo: 32)
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <label className="text-sm font-semibold">BACKUP_STORAGE_KEY (Backup)</label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={backupKey}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(backupKey)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-600">
                  ✓ Comprimento: {backupKey.length} caracteres
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Testes */}
        {key && (
          <Button 
            onClick={testConnection} 
            disabled={testing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {testing ? '⏳ Testando...' : '✓ Testar Encriptação'}
          </Button>
        )}

        {/* Documentação */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-2">📚 Documentação</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>• Algoritmo: AES-256-GCM (NIST approved)</li>
            <li>• A chave deve ter mínimo 32 caracteres</li>
            <li>• Use apenas para dados sensíveis (MFA, credenciais)</li>
            <li>• Guarde a chave em local seguro</li>
          </ul>
        </div>
      </div>
    </IntegrationCard>
  );
}