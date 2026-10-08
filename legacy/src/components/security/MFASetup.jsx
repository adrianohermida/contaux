import React, { useState, useCallback } from 'react';
import { Shield, Copy, CheckCircle, AlertCircle, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

/**
 * MFA Setup - Two-Factor Authentication (TOTP)
 * QR code generation, backup codes, verification
 */
export default function MFASetup({ onMFAEnabled }) {
  const [step, setStep] = useState(1); // 1: Generate, 2: Verify
  const [secret, setSecret] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateMFASecret = useCallback(async () => {
    setLoading(true);
    try {
      // Chamar backend function para gerar secret
      const response = await base44.functions.invoke('generateMFASecret', {
        email: (await base44.auth.me()).email
      });

      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setBackupCodes(response.data.backupCodes);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMFA = useCallback(async () => {
    if (!verificationCode) {
      setError('Código obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('verifyMFAToken', {
        secret,
        token: verificationCode
      });

      if (response.data.valid) {
        onMFAEnabled?.();
        setStep(3); // Success
      } else {
        setError('Código inválido');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [secret, verificationCode, onMFAEnabled]);

  const copyBackupCode = useCallback((code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Autenticação em Dois Fatores (2FA)</h3>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Aumente a segurança da sua conta com autenticação em dois fatores usando um app como Google Authenticator ou Authy.
          </p>
          <Button onClick={generateMFASecret} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              'Iniciar Configuração'
            )}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-3">
              1. Escaneie o código QR com seu app authenticator:
            </p>
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="QR Code" className="w-32 h-32" />
              </div>
            )}
            <p className="text-xs text-blue-800 mb-3">Ou insira manualmente:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white p-2 rounded font-mono text-xs">{secret}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(secret);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Código do App (6 dígitos)</label>
            <Input
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              className="text-center tracking-widest"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button onClick={verifyMFA} disabled={loading || !verificationCode} className="w-full">
            {loading ? 'Verificando...' : 'Verificar e Ativar'}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">2FA Ativado com Sucesso!</p>
              <p className="text-sm text-green-800 mt-1">Sua conta está protegida</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900 mb-3">
              Códigos de Backup (Guarde em local seguro):
            </p>
            <div className="space-y-2">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded">
                  <code className="font-mono text-xs flex-1">{code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyBackupCode(code)}
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}