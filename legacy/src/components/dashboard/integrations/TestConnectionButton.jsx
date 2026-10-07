import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function TestConnectionButton({ integration, onSuccess, disabled }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('testIntegration', {
        integration
      });

      if (response.data.tests[integration]?.status === 'ok') {
        setResult({ success: true, message: response.data.tests[integration].message });
        onSuccess?.();
      } else {
        setResult({ 
          success: false, 
          message: response.data.tests[integration]?.message || 'Erro ao testar' 
        });
      }
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleTest}
        disabled={disabled || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testando...
          </>
        ) : (
          '✓ Testar Conexão'
        )}
      </Button>

      {result && (
        <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}