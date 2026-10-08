/**
 * Subscription Manager
 * Manage notification preferences/subscriptions
 */

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SUBSCRIPTION_TYPES = [
  {
    key: 'contact_updates',
    icon: MessageSquare,
    title: 'Atualizações de Contatos',
    description: 'Notificado quando contatos são atualizados ou adicionados',
  },
  {
    key: 'tags',
    icon: Bell,
    title: 'Alterações de Tags',
    description: 'Notificado quando tags são adicionadas ou removidas',
  },
  {
    key: 'activities',
    icon: AlertCircle,
    title: 'Atividades',
    description: 'Notificado sobre atividades em contatos',
  },
  {
    key: 'reminders',
    icon: Bell,
    title: 'Lembretes',
    description: 'Lembretes para follow-ups e tarefas',
  },
  {
    key: 'email_digest',
    icon: Mail,
    title: 'Resumo por Email',
    description: 'Receba um resumo diário de atividades por email',
  },
];

export default function SubscriptionManager({ workspaceId, userId }) {
  const [preferences, setPreferences] = useState({
    contact_updates: true,
    tags: true,
    activities: false,
    reminders: true,
    email_digest: false,
  });

  const queryClient = useQueryClient();

  // Fetch user preferences
  const { isLoading } = useQuery({
    queryKey: ['notification-preferences', workspaceId, userId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = user.notification_preferences || {};
      setPreferences(prev => ({ ...prev, ...prefs }));
      return prefs;
    },
    enabled: !!workspaceId && !!userId,
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (newPrefs) => {
      return await base44.auth.updateMe({
        notification_preferences: newPrefs,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const handleToggle = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    updateMutation.mutate(newPrefs);
  };

  if (isLoading) {
    return <div className="text-sm text-slate-600 dark:text-slate-400">Carregando preferências...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Preferências de Notificações
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Escolha quando você deseja ser notificado
        </p>
      </div>

      <div className="space-y-3">
        {SUBSCRIPTION_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <div
              key={type.key}
              className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <div className="flex gap-3 flex-1">
                <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {type.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {type.description}
                  </p>
                </div>
              </div>

              <Switch
                checked={preferences[type.key]}
                onCheckedChange={() => handleToggle(type.key)}
                disabled={updateMutation.isPending}
                aria-label={`Toggle ${type.title}`}
              />
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Você pode gerenciar essas preferências a qualquer momento. Desabilite notificações para reduzir interrupções.
        </p>
      </div>
    </div>
  );
}