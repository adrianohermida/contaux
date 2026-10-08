import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ContactMergeDialog({ workspaceId, primaryContact, secondaryContact, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [mergedData, setMergedData] = useState(null);
  const queryClient = useQueryClient();

  // Fetch full contact details
  const { data: primaryFull } = useQuery({
    queryKey: ['contact-merge', primaryContact.id],
    queryFn: () => base44.entities.Client.get(primaryContact.id),
  });

  const { data: secondaryFull } = useQuery({
    queryKey: ['contact-merge', secondaryContact.id],
    queryFn: () => base44.entities.Client.get(secondaryContact.id),
  });

  const mergeMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('mergeContacts', {
        workspace_id: workspaceId,
        primary_contact_id: primaryContact.id,
        secondary_contact_id: secondaryContact.id,
        merged_data: mergedData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-detail'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
      setStep(3);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    },
  });

  React.useEffect(() => {
    if (primaryFull && secondaryFull && !mergedData) {
      // Pre-fill merged data with primary contact as base
      setMergedData({
        company_name: primaryFull.company_name || secondaryFull.company_name,
        email: primaryFull.email || secondaryFull.email,
        phone: primaryFull.phone || secondaryFull.phone,
        client_type: primaryFull.client_type,
        status: primaryFull.status,
        cnpj: primaryFull.cnpj || secondaryFull.cnpj,
        cpf: primaryFull.cpf || secondaryFull.cpf,
        endereco: primaryFull.endereco || secondaryFull.endereco,
        numero: primaryFull.numero || secondaryFull.numero,
        complemento: primaryFull.complemento || secondaryFull.complemento,
        bairro: primaryFull.bairro || secondaryFull.bairro,
        cidade: primaryFull.cidade || secondaryFull.cidade,
        uf: primaryFull.uf || secondaryFull.uf,
        cep: primaryFull.cep || secondaryFull.cep,
      });
    }
  }, [primaryFull, secondaryFull]);

  const handleFieldSelect = (field, value) => {
    setMergedData(prev => ({ ...prev, [field]: value }));
  };

  const handleMerge = () => {
    mergeMutation.mutate();
  };

  if (!primaryFull || !secondaryFull) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <p className="text-center py-8">Carregando detalhes dos contatos...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Mesclar Contatos - Etapa {step} de 3
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                O contato secundário será deletado permanentemente após a mesclagem.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-green-600 mb-2">CONTATO PRINCIPAL (MANTER)</p>
                  <p className="font-medium">{primaryFull.company_name}</p>
                  <p className="text-sm text-slate-600">{primaryFull.email}</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-red-600 mb-2">CONTATO SECUNDÁRIO (DELETAR)</p>
                  <p className="font-medium">{secondaryFull.company_name}</p>
                  <p className="text-sm text-slate-600">{secondaryFull.email}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">O que será transferido:</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Todas as notas</li>
                <li>Todas as tags</li>
                <li>Todo o histórico de atividades</li>
                <li>Todos os relacionamentos</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Escolha quais valores manter para cada campo:
            </p>

            {['company_name', 'email', 'phone', 'cnpj', 'cpf', 'endereco', 'cidade'].map((field) => {
              const primaryValue = primaryFull[field];
              const secondaryValue = secondaryFull[field];

              if (!primaryValue && !secondaryValue) return null;

              return (
                <div key={field} className="space-y-2">
                  <label className="text-sm font-medium capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleFieldSelect(field, primaryValue)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        mergedData?.[field] === primaryValue
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-slate-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{primaryValue || '—'}</span>
                        {mergedData?.[field] === primaryValue && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleFieldSelect(field, secondaryValue)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        mergedData?.[field] === secondaryValue
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-slate-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{secondaryValue || '—'}</span>
                        {mergedData?.[field] === secondaryValue && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Mesclagem Concluída!</h3>
            <p className="text-slate-600">
              Os contatos foram mesclados com sucesso.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button onClick={onClose} variant="outline">
                Cancelar
              </Button>
              <Button onClick={() => setStep(2)} className="gap-2">
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button onClick={() => setStep(1)} variant="outline">
                Voltar
              </Button>
              <Button
                onClick={handleMerge}
                disabled={mergeMutation.isPending}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                {mergeMutation.isPending ? 'Mesclando...' : 'Confirmar Mesclagem'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}