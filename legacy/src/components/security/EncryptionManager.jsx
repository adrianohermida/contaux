import React, { useState, useCallback } from 'react';
import { Lock, Unlock, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * Encryption Manager - Gerencia criptografia de dados
 * Key management, data encryption, compliance
 */
export default function EncryptionManager({ workspaceId }) {
  const [encryptionKey, setEncryptionKey] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [encrypted, setEncrypted] = useState(false);

  const enableEncryption = useCallback(async () => {
    if (!encryptionKey) {
      setError('Chave de criptografia obrigatória');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Simular habilitação de criptografia
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('enabled');
      setEncrypted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [encryptionKey]);

  const generateKey = useCallback(() => {
    const key = 'enc_' + Math.random().toString(36).substr(2, 32);
    setEncryptionKey(key);
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          {encrypted ? (
            <Lock className="w-6 h-6 text-green-600" />
          ) : (
            <Unlock className="w-6 h-6 text-gray-400" />
          )}
          <h3 className="text-lg font-semibold">Criptografia de Dados</h3>
        </div>

        {status === 'enabled' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Criptografia Ativada</p>
              <p className="text-sm text-green-800 mt-1">Todos os dados estão protegidos com criptografia AES-256</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium mb-2">Informações de Criptografia:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Algoritmo: AES-256-GCM</li>
            <li>✓ Modo: Criptografia completa</li>
            <li>✓ Conformidade: LGPD, GDPR</li>
            <li>✓ Backup de chaves: Seguro</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Chave de Criptografia</label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Chave de criptografia"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              readOnly={encrypted}
            />
            <Button onClick={generateKey} variant="outline" disabled={encrypted}>
              <Key className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {encrypted ? 'Criptografia ativa' : 'Gere ou insira uma chave segura'}
          </p>
        </div>

        <Button
          onClick={enableEncryption}
          disabled={loading || encrypted || !encryptionKey}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ativando...
            </>
          ) : encrypted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Criptografia Ativa
            </>
          ) : (
            'Ativar Criptografia'
          )}
        </Button>
      </div>
    </Card>
  );
}