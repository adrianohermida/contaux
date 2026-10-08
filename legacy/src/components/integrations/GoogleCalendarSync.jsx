import React, { useState, useCallback } from 'react';
import { Calendar, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Google Calendar Sync - Integração com Google Calendar
 * Sincroniza eventos e deadlines
 */
export default function GoogleCalendarSync({ workspaceId, onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [syncedEvents, setSyncedEvents] = useState(0);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      // TODO: Implementar OAuth com Google Calendar
      // Usar base44.connectors para autorização
      
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncedEvents(15);
      setStatus('success');
      onSyncComplete?.();
    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setSyncing(false);
    }
  }, [onSyncComplete]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Sincronizar Google Calendar</h3>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Sincronização concluída!</p>
              <p className="text-sm text-green-800 mt-1">{syncedEvents} eventos sincronizados</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Erro na sincronização</p>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium mb-2">
            Sincronize eventos de:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Deadlines de processos judiciais</li>
            <li>✓ Prazos de pagamento</li>
            <li>✓ Reuniões agendadas</li>
            <li>✓ Eventos importantes</li>
          </ul>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="w-full"
        >
          {syncing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            'Sincronizar Google Calendar'
          )}
        </Button>
      </div>
    </Card>
  );
}