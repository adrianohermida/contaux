/**
 * Webhook Tester
 * Test webhook endpoints with sample payloads
 */

import React, { useState } from 'react';
import { Loader2, Send, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function WebhookTester() {
  const [testUrl, setTestUrl] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('contact.created');
  const [payload, setPayload] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const SAMPLE_PAYLOADS = {
    'contact.created': {
      event: 'contact.created',
      data: {
        id: 'test-123',
        company_name: 'Empresa Teste',
        email: 'teste@exemplo.com',
        phone: '+55 11 98765-4321',
        cnpj: '12.345.678/0001-99',
      },
      timestamp: new Date().toISOString(),
    },
    'contact.updated': {
      event: 'contact.updated',
      data: {
        id: 'test-123',
        company_name: 'Empresa Teste Atualizada',
        email: 'novo@exemplo.com',
      },
      timestamp: new Date().toISOString(),
    },
    'tag.added': {
      event: 'tag.added',
      data: {
        contact_id: 'test-123',
        tag_name: 'VIP',
        tag_color: 'red',
      },
      timestamp: new Date().toISOString(),
    },
  };

  const handleTest = async () => {
    if (!testUrl) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload || JSON.stringify(SAMPLE_PAYLOADS[selectedEvent] || {}),
      });

      setResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Testar Webhook
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Teste sua URL de webhook com dados de exemplo
        </p>
      </div>

      {/* URL Input */}
      <div>
        <label htmlFor="test-url" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          URL do Webhook
        </label>
        <Input
          id="test-url"
          type="url"
          placeholder="https://seu-dominio.com/webhook"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          className="min-h-[44px]"
          aria-label="URL do webhook para teste"
        />
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="event-type" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          Tipo de Evento
        </label>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger id="event-type" className="min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contact.created">Contato Criado</SelectItem>
            <SelectItem value="contact.updated">Contato Atualizado</SelectItem>
            <SelectItem value="tag.added">Tag Adicionada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payload */}
      <div>
        <label htmlFor="payload" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          Payload (opcional - use o padrão se deixar vazio)
        </label>
        <Textarea
          id="payload"
          placeholder={JSON.stringify(SAMPLE_PAYLOADS[selectedEvent], null, 2)}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="font-mono text-xs min-h-[150px] resize-none"
          aria-label="JSON payload para teste"
        />
      </div>

      {/* Test Button */}
      <Button
        onClick={handleTest}
        disabled={!testUrl || isLoading}
        className="w-full gap-2 min-h-[44px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Testando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" aria-hidden="true" />
            Enviar Teste
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex gap-2">
            {result.success ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" aria-hidden="true" />
            )}
            <div className="flex-1">
              <p className={`font-medium text-sm ${
                result.success
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {result.success ? 'Webhook testado com sucesso!' : 'Falha ao testar webhook'}
              </p>
              {result.status && (
                <p className={`text-xs ${
                  result.success
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.status} {result.statusText}
                </p>
              )}
              {result.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {result.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}