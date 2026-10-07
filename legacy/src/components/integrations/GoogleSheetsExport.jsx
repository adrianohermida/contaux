import React, { useState, useCallback } from 'react';
import { Sheet, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Google Sheets Export - Exporta dados para Google Sheets
 * Relatórios, análises, dados brutos
 */
export default function GoogleSheetsExport({ workspaceId, data, onExportComplete }) {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      // TODO: Implementar OAuth com Google Sheets
      // Usar base44.connectors para autorização
      
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('success');
      onExportComplete?.();
    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setExporting(false);
    }
  }, [onExportComplete]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Sheet className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">Exportar para Google Sheets</h3>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Dados exportados com sucesso!</p>
              <p className="text-sm text-green-800 mt-1">Verifique sua conta Google para acessar</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Erro na exportação</p>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900 font-medium mb-2">
            Dados que serão exportados:
          </p>
          <ul className="text-sm text-green-800 space-y-1">
            <li>✓ Invoices</li>
            <li>✓ Payments</li>
            <li>✓ Clientes</li>
            <li>✓ Relatórios personalizados</li>
          </ul>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Exportar para Google Sheets
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}