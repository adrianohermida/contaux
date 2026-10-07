import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export default function ComparisonCard({ tenantId }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComparison = async () => {
      if (!tenantId) return;
      try {
        const result = await base44.functions.invoke('generateComparisonReport', { tenantId });
        setComparison(result.data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };
    loadComparison();
  }, [tenantId]);

  if (loading) return <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-32"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  if (!comparison) return null;

  const renderTrend = (data) => (
    <div className="flex items-center gap-2">
      {data.trend === 'up' ? (
        <TrendingUp className="w-5 h-5 text-green-500" />
      ) : (
        <TrendingDown className="w-5 h-5 text-amber-500" />
      )}
      <span className={data.change >= 0 ? 'text-green-600' : 'text-amber-600'}>
        {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Comparativo de Períodos</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-slate-600 mb-4">{comparison.previousMonth} vs {comparison.currentMonth}</p>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-slate-600">Receita</p>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-xs text-slate-500">Anterior</p>
                  <p className="font-semibold">R$ {comparison.comparison.revenue.previous.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Atual</p>
                  <p className="font-semibold">R$ {comparison.comparison.revenue.current.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between items-center">
                <span className="text-xs text-slate-600">Variação</span>
                {renderTrend(comparison.comparison.revenue)}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded">
              <p className="text-sm text-slate-600">Faturas Pagas</p>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-xs text-slate-500">Anterior</p>
                  <p className="font-semibold">{comparison.comparison.paid.previous}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Atual</p>
                  <p className="font-semibold">{comparison.comparison.paid.current}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between items-center">
                <span className="text-xs text-slate-600">Variação</span>
                {renderTrend(comparison.comparison.paid)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded p-4">
          <h4 className="font-semibold mb-3">Insights</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Faturamento {comparison.comparison.revenue.change >= 0 ? 'aumentou' : 'diminuiu'} {Math.abs(comparison.comparison.revenue.change).toFixed(1)}%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Taxa de recebimento {comparison.comparison.paid.change >= 0 ? 'melhorou' : 'piorou'} {Math.abs(comparison.comparison.paid.change).toFixed(1)}%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>{comparison.comparison.invoicesCount.current} faturas emitidas este mês</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}