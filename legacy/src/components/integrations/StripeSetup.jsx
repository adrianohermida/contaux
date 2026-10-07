import React, { useState, useCallback } from 'react';
import { CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

/**
 * Stripe Setup - Configuração e integração com Stripe
 * Pagamentos, webhooks, subscriptions
 */
export default function StripeSetup({ workspaceId, onConfigComplete }) {
  const [stripeKey, setStripeKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = useCallback(async () => {
    if (!stripeKey) {
      setError('Chave Stripe obrigatória');
      return;
    }

    setTesting(true);
    setError(null);
    try {
      // Salvar chave como secret (em produção, usar ambiente)
      await base44.auth.updateMe({
        stripe_key: stripeKey,
        workspace_id: workspaceId
      });

      setStatus('success');
      onConfigComplete?.();
    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setTesting(false);
    }
  }, [stripeKey, workspaceId, onConfigComplete]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Conectar Stripe</h3>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Conectado com sucesso!</p>
              <p className="text-sm text-green-800 mt-1">Você pode agora processar pagamentos</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Erro na conexão</p>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Chave da API (sk_live_...)</label>
          <input
            type="password"
            placeholder="sk_live_..."
            value={stripeKey}
            onChange={(e) => setStripeKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Obtenha sua chave em: <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600">dashboard.stripe.com</a>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Funcionalidades disponíveis:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>✓ Processar pagamentos</li>
            <li>✓ Gerenciar cartões</li>
            <li>✓ Webhooks automáticos</li>
            <li>✓ Subscriptions</li>
          </ul>
        </div>

        <Button
          onClick={handleConnect}
          disabled={testing || !stripeKey}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            'Conectar Stripe'
          )}
        </Button>
      </div>
    </Card>
  );
}