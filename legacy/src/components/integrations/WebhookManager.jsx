/**
 * Webhook Manager
 * Create and manage webhooks for contact events
 */

import React, { useState } from 'react';
import { Loader2, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEBHOOK_EVENTS = [
  { value: 'contact.created', label: 'Contato Criado' },
  { value: 'contact.updated', label: 'Contato Atualizado' },
  { value: 'contact.deleted', label: 'Contato Deletado' },
  { value: 'tag.added', label: 'Tag Adicionada' },
  { value: 'tag.removed', label: 'Tag Removida' },
  { value: 'relationship.created', label: 'Relacionamento Criado' },
  { value: 'relationship.deleted', label: 'Relacionamento Deletado' },
];

export default function WebhookManager({ workspaceId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', events: [] });
  const [deleteId, setDeleteId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch webhooks
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks', workspaceId],
    queryFn: async () => {
      // Assuming Webhook entity exists
      return await base44.entities.Webhook?.filter({ workspace_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Create webhook mutation
  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.Webhook?.create({
        workspace_id: workspaceId,
        url: formData.url,
        events: formData.events,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
      setFormData({ url: '', events: [] });
      setShowForm(false);
    },
  });

  // Delete webhook mutation
  const deleteMutation = useMutation({
    mutationFn: (webhookId) => base44.entities.Webhook?.delete(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
      setDeleteId(null);
    },
  });

  // Toggle webhook active status
  const toggleMutation = useMutation({
    mutationFn: ({ webhookId, isActive }) =>
      base44.entities.Webhook?.update(webhookId, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
    },
  });

  const handleToggleEvent = (event) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando webhooks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Webhooks</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Integre com sistemas externos via webhooks
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Novo Webhook
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <label htmlFor="webhook-url" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              URL do Webhook
            </label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://seu-dominio.com/webhook"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="min-h-[44px]"
              aria-label="URL do webhook"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enviaremos POST requests para este URL quando eventos ocorrem
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-slate-900 dark:text-slate-100">
              Eventos para Inscrever
            </label>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map(event => (
                <label key={event.value} className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event.value)}
                    onChange={() => handleToggleEvent(event.value)}
                    className="w-4 h-4"
                    aria-label={`Inscrever em ${event.label}`}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {event.label}
                  </span>
                </label>
              ))}
            </div>
            {formData.events.length === 0 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Selecione pelo menos um evento
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!formData.url || formData.events.length === 0 || createMutation.isPending}
              className="flex-1 gap-2 min-h-[44px]"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Criando...
                </>
              ) : (
                'Criar Webhook'
              )}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              disabled={createMutation.isPending}
              className="min-h-[44px]"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {webhooks.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhum webhook configurado
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map(webhook => (
            <div
              key={webhook.id}
              className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all">
                      {webhook.url}
                    </p>
                    <Button
                      onClick={() => handleCopyUrl(webhook.url)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      aria-label="Copiar URL"
                      title="Copiar"
                    >
                      {copiedId === webhook.url ? (
                        <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events?.map(event => (
                      <span
                        key={event}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded"
                      >
                        {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      webhook.is_active
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {webhook.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Criado em {format(new Date(webhook.created_date), 'dd MMM, HH:mm', { locale: ptBR })}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => toggleMutation.mutate({ webhookId: webhook.id, isActive: webhook.is_active })}
                  variant="outline"
                  size="sm"
                  disabled={toggleMutation.isPending}
                  className="flex-1 min-h-[40px]"
                >
                  {webhook.is_active ? 'Desabilitar' : 'Habilitar'}
                </Button>
                <Button
                  onClick={() => setDeleteId(webhook.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[40px] px-3"
                  aria-label="Deletar webhook"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(val) => !val && setDeleteId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este webhook? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Formato do Webhook:</p>
        <pre className="text-xs bg-blue-900/30 p-2 rounded text-blue-300 overflow-x-auto">
{`POST /webhook
{
  "event": "contact.created",
  "data": { /* entity data */ },
  "timestamp": "2026-03-01T12:00:00Z"
}`}
        </pre>
      </div>
    </div>
  );
}