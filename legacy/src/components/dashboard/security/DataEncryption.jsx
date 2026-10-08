import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataEncryption({ workspaceId }) {
  const queryClient = useQueryClient();
  const [selectedFields, setSelectedFields] = useState({
    client_email: true,
    client_phone: true,
    payment_info: true
  });

  const { data: encryptionStatus = {} } = useQuery({
    queryKey: ['encryption-status', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const response = await base44.functions.invoke('validateEncryptionKey', {
          workspaceId: workspaceId
        });
        return response.data || {};
      } catch (err) {
        console.error('Error loading encryption status:', err);
        return { isConfigured: false, fieldsEncrypted: 0 };
      }
    },
    enabled: !!workspaceId
  });

  const encryptMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('encryptionService', {
        action: 'encrypt',
        workspaceId: workspaceId,
        fields: Object.keys(selectedFields).filter(f => selectedFields[f])
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.fieldsEncrypted} campos criptografados com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['encryption-status', workspaceId] });
    },
    onError: () => {
      toast.error('Erro ao criptografar dados');
    }
  });

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Criptografia de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {encryptionStatus.isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <p className="font-medium text-slate-900">Status</p>
              </div>
              <p className="text-sm text-slate-600">
                {encryptionStatus.isConfigured ? 'Ativo' : 'Não Configurado'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <p className="font-medium text-slate-900">Campos</p>
              </div>
              <p className="text-sm text-slate-600">
                {encryptionStatus.fieldsEncrypted || 0} criptografados
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <p className="font-medium text-slate-900">Chave</p>
              </div>
              <p className="text-sm text-slate-600">
                {encryptionStatus.keyRotation ? 'Ativa' : 'Manual'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Campos para Criptografar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { id: 'client_email', label: 'Email de Clientes', desc: 'Endereços de email dos clientes' },
              { id: 'client_phone', label: 'Telefone de Clientes', desc: 'Números de telefone dos clientes' },
              { id: 'payment_info', label: 'Dados de Pagamento', desc: 'Informações de cartão e pagamento' }
            ].map(field => (
              <label key={field.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields[field.id]}
                  onChange={(e) => setSelectedFields({
                    ...selectedFields,
                    [field.id]: e.target.checked
                  })}
                  className="w-4 h-4 mt-1 rounded border-slate-300"
                />
                <div>
                  <p className="font-medium text-slate-900">{field.label}</p>
                  <p className="text-xs text-slate-600">{field.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <Button
            onClick={() => encryptMutation.mutate()}
            disabled={encryptMutation.isPending || !Object.values(selectedFields).some(v => v)}
            className="w-full gap-2"
          >
            {encryptMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criptografando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Criptografar Dados Selecionados
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Boas Práticas de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            'Faça backup de suas chaves de criptografia regularmente',
            'Nunca compartilhe suas chaves com terceiros',
            'Use senhas fortes e únicas para sua conta',
            'Ative autenticação de dois fatores (MFA)',
            'Revise logs de acesso regularmente',
            'Mantenha seu software sempre atualizado'
          ].map((practice, idx) => (
            <div key={idx} className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{practice}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}