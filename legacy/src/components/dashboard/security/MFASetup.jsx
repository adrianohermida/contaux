import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MFASetup() {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: BackupCodes
  const [secret, setSecret] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [copied, setCopied] = useState(false);

  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateMFASecret', {});
      return response.data;
    },
    onSuccess: (data) => {
      setSecret(data.secret);
      setQrCode(data.qrCode);
      toast.success('Secret MFA gerado');
    },
    onError: () => {
      toast.error('Erro ao gerar secret');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('verifyMFAToken', {
        secret: secret,
        token: verificationCode
      });
      return response.data;
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setStep(3);
      toast.success('MFA ativado com sucesso!');
    },
    onError: () => {
      toast.error('Código inválido. Tente novamente.');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Setup */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Autenticação Multi-Fator (MFA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Configure autenticação de dois fatores para maior segurança da sua conta.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ℹ️ Você precisará de um aplicativo autenticador como Google Authenticator, Microsoft Authenticator ou Authy.
              </p>
            </div>

            <Button
              onClick={() => setupMutation.mutate()}
              disabled={setupMutation.isPending}
              className="w-full gap-2"
            >
              {setupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Iniciar Configuração MFA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Verify */}
      {step === 2 && secret && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Aplicativo Autenticador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">1. Escanear código QR</p>
              {qrCode && (
                <div className="bg-white p-4 border border-slate-200 rounded-lg w-fit mx-auto">
                  <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
                </div>
              )}

              <p className="text-sm font-medium text-slate-700">2. Ou digite a chave manualmente:</p>
              <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                <code className="text-sm font-mono">{secret}</code>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="p-2 hover:bg-slate-200 rounded"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>

              <p className="text-sm font-medium text-slate-700">3. Digite o código de verificação:</p>
              <input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-2xl text-center font-mono tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => {
                  if (verificationCode.length === 6) {
                    verifyMutation.mutate();
                    setStep(3);
                  } else {
                    toast.error('Digite um código válido');
                  }
                }}
                disabled={verifyMutation.isPending || verificationCode.length !== 6}
                className="flex-1 gap-2"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Backup Codes */}
      {step === 3 && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              MFA Ativado com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                ✓ Sua conta está protegida com autenticação de dois fatores.
              </p>
            </div>

            <p className="text-sm font-medium text-slate-700">Códigos de Recuperação:</p>
            <p className="text-xs text-slate-600 mb-3">
              Guarde estes códigos em um local seguro. Use-os para acessar sua conta se perder acesso ao seu autenticador.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2 font-mono text-sm">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span>{code}</span>
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <Copy className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                const text = backupCodes.join('\n');
                copyToClipboard(text);
              }}
              variant="outline"
              className="w-full gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Todos os Códigos
            </Button>

            <Button className="w-full gap-2">
              <Check className="w-4 h-4" />
              Concluído
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}