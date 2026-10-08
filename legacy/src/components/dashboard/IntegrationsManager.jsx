import React, { useState, useMemo } from 'react';
import { Key, CheckCircle2, AlertCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntegrationCard from './integrations/IntegrationCard';
import EncryptionSetup from './integrations/EncryptionSetup';
import VoximplantSetup from './integrations/VoximplantSetup';
import GoogleSheetsSetup from './integrations/GoogleSheetsSetup';
import GoogleCalendarSetup from './integrations/GoogleCalendarSetup';
import BackupStorageSetup from './integrations/BackupStorageSetup';

const INTEGRATIONS = [
  {
    id: 'encryption',
    name: 'Encriptação (AES-256)',
    category: 'security',
    description: 'Encriptação de dados sensíveis (MFA, credenciais)',
    status: 'pending',
    required: true,
    icon: '🔐'
  },
  {
    id: 'voximplant',
    name: 'Voximplant',
    category: 'communication',
    description: 'Chamadas VoIP, videoconferência e chat',
    status: 'pending',
    required: false,
    icon: '☎️'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'productivity',
    description: 'Sincronização de dados com planilhas',
    status: 'pending',
    required: false,
    icon: '📊'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'productivity',
    description: 'Integração com calendário Google',
    status: 'pending',
    required: false,
    icon: '📅'
  },
  {
    id: 'backup-storage',
    name: 'Backup Storage',
    category: 'security',
    description: 'Armazenamento seguro de backups (Supabase/S3)',
    status: 'pending',
    required: false,
    icon: '💾'
  }
];

const CATEGORIES = {
  security: 'Segurança',
  communication: 'Comunicação',
  productivity: 'Produtividade'
};

export default function IntegrationsManager() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredIntegrations = useMemo(() => {
    if (filter === 'all') return INTEGRATIONS;
    if (filter === 'required') return INTEGRATIONS.filter(i => i.required);
    return INTEGRATIONS.filter(i => i.category === filter);
  }, [filter]);

  const setupComponents = {
    encryption: EncryptionSetup,
    voximplant: VoximplantSetup,
    'google-sheets': GoogleSheetsSetup,
    'google-calendar': GoogleCalendarSetup,
    'backup-storage': BackupStorageSetup
  };

  const SelectedSetup = selectedIntegration ? setupComponents[selectedIntegration] : null;

  if (SelectedSetup) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedIntegration(null)}
          className="flex items-center gap-2"
        >
          ← Voltar
        </Button>
        <SelectedSetup integrationId={selectedIntegration} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Integrações e Secrets</h2>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Ative as integrações necessárias</p>
          <p className="text-sm text-blue-800 mt-1">
            Cada integração requer configuração de credenciais. Siga os assistentes para obter as keys necessárias.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          variant={filter === 'required' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('required')}
          className="gap-2"
        >
          Recomendadas
        </Button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Agrupado por categoria */}
      {Object.entries(CATEGORIES).map(([categoryKey, categoryLabel]) => {
        const categoryIntegrations = filteredIntegrations.filter(i => i.category === categoryKey);
        if (categoryIntegrations.length === 0) return null;

        return (
          <div key={categoryKey} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              {categoryLabel}
              <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
                {categoryIntegrations.length}
              </span>
            </h3>
            <div className="grid gap-4">
              {categoryIntegrations.map(integration => (
                <div
                  key={integration.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="text-3xl">{integration.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{integration.name}</h4>
                          {integration.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedIntegration(integration.id)}
                      className="whitespace-nowrap gap-2"
                    >
                      Configurar
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}