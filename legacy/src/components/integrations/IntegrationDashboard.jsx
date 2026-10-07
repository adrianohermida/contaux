/**
 * Integration Dashboard
 * Unified interface for webhooks and integrations
 */

import React, { useState } from 'react';
import { Zap, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebhookManager from './WebhookManager';
import WebhookTester from './WebhookTester';
import IntegrationEventLog from './IntegrationEventLog';

export default function IntegrationDashboard({ workspaceId }) {
  const [activeTab, setActiveTab] = useState('webhooks');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Integrações
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Configure webhooks e integre com sistemas externos
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 min-h-[44px]">
          <TabsTrigger value="webhooks" className="gap-2">
            <LinkIcon className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="tester" className="gap-2">
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Testar</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <LinkIcon className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookManager workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="tester" className="space-y-4">
          <WebhookTester />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <IntegrationEventLog workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
          Como funcionam os Webhooks?
        </p>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Quando um evento ocorre (contato criado, tag adicionada), enviamos um POST request para sua URL</li>
          <li>• O payload contém informações sobre o evento e os dados relacionados</li>
          <li>• Use o Tester para validar sua implementação antes de usar em produção</li>
          <li>• Consulte o Log de Eventos para monitorar entrega de webhooks</li>
        </ul>
      </div>
    </div>
  );
}