import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export default function RLSDebugger() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const validateRLS = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('initializeRLSPolicies', {
        action: 'validate'
      });
      setResults(data);
      toast.success('Validação RLS concluída');
    } catch (err) {
      const message = err.message || 'Erro ao validar RLS';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const testIsolation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('initializeRLSPolicies', {
        action: 'test_isolation',
        target_workspace_id: 'other-workspace-test'
      });
      setResults(data);
      toast.success('Teste de isolamento concluído');
    } catch (err) {
      const message = err.message || 'Erro ao testar isolamento';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const viewSQLExample = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('initializeRLSPolicies', {
        action: 'generate_sql'
      });
      setResults(data);
      toast.success('SQL gerado com sucesso');
    } catch (err) {
      const message = err.message || 'Erro ao gerar SQL';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-[var(--spacing-lg)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-[var(--spacing-2xl)]">
          <div>
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">RLS Debugger</h1>
            <p className="text-[var(--color-foreground-secondary)]">Validar e testar Row Level Security</p>
          </div>
          {(results || error) && (
            <Button onClick={clearResults} variant="outline" size="sm" className="gap-[var(--spacing-sm)]">
              <RefreshCw className="w-4 h-4" />
              Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)] mb-[var(--spacing-2xl)]">
          <Button
            onClick={validateRLS}
            disabled={loading}
            className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-[var(--spacing-sm)] animate-spin" /> : null}
            Validar RLS Status
          </Button>
          <Button
            onClick={testIsolation}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-[var(--spacing-sm)] animate-spin" /> : null}
            Testar Isolamento
          </Button>
          <Button
            onClick={viewSQLExample}
            disabled={loading}
            className="bg-slate-600 hover:bg-slate-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-[var(--spacing-sm)] animate-spin" /> : null}
            Ver SQL Example
          </Button>
        </div>

        {error && (
          <Card className="p-[var(--spacing-md)] mb-[var(--spacing-lg)] bg-red-50 border-red-300">
            <div className="flex gap-[var(--spacing-md)] items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Erro</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {results && (
          <Card className="p-[var(--spacing-lg)]">
            <div className="mb-[var(--spacing-md)] flex items-center gap-[var(--spacing-sm)]">
              {results.summary?.overall_status?.includes('✅') ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600" />
              )}
              <h2 className="text-xl font-semibold">
                {results.summary?.overall_status || results.action}
              </h2>
            </div>

            <pre className="bg-slate-100 p-[var(--spacing-md)] rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}