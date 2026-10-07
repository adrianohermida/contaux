import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DuplicateAlertsWidget({ workspaceId }) {
  const { data: duplicateData, isLoading } = useQuery({
    queryKey: ['scan-duplicates', workspaceId],
    queryFn: async () => {
      const result = await base44.functions.invoke('scanDuplicates', { 
        workspace_id: workspaceId 
      });
      return result.data;
    },
    enabled: !!workspaceId,
    staleTime: 15 * 60 * 1000, // Cache 15 min
  });

  const duplicateCount = duplicateData?.totalFound || 0;
  const hasDuplicates = duplicateCount > 0;
  const isHigh = duplicateCount > 5;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-slate-400" />
            Alertas de Duplicatas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Escaneando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={hasDuplicates ? 'border-yellow-300 dark:border-yellow-700' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className={`w-5 h-5 ${hasDuplicates ? 'text-yellow-600' : 'text-slate-400'}`} />
          Alertas de Duplicatas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasDuplicates ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Base de dados limpa!
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Nenhuma duplicata detectada
            </p>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-lg ${
              isHigh 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${
                  isHigh ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-2xl font-bold ${
                    isHigh ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {duplicateCount}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {duplicateCount === 1 ? 'Duplicata encontrada' : 'Duplicatas encontradas'}
                  </p>
                </div>
              </div>
            </div>

            {isHigh && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ⚠️ <strong>Atenção:</strong> Alto número de duplicatas pode impactar a qualidade dos dados e relatórios.
                </p>
              </div>
            )}
          </>
        )}

        <Link to={createPageUrl('Contact')} className="block">
          <Button 
            variant={hasDuplicates ? "default" : "outline"}
            className={`w-full ${hasDuplicates ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
          >
            <Search className="w-4 h-4 mr-2" />
            {hasDuplicates ? 'Revisar Duplicatas' : 'Buscar Duplicatas'}
          </Button>
        </Link>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {hasDuplicates 
            ? 'Recomendamos revisar e mesclar contatos duplicados'
            : 'Execute scan periódicos para manter a base limpa'
          }
        </p>
      </CardContent>
    </Card>
  );
}