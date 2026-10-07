import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function RevenueForecaster({ invoices = [] }) {
  const forecasts = useMemo(() => {
    if (invoices.length === 0) return { scenarios: [], summary: null };

    // Monthly aggregation
    const monthlyData = {};
    invoices.forEach(inv => {
      const date = new Date(inv.created_date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += inv.total_amount || 0;
    });

    const months = Object.keys(monthlyData).sort();
    const values = months.map(m => monthlyData[m]);

    // Linear regression for base scenario
    const n = values.length;
    const sumX = n * (n + 1) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i + 1) * val, 0);
    const sumX2 = n * (n + 1) * (2 * n + 1) / 6;
    const sumYsq = values.reduce((a, b) => a + (b * b), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Standard deviation for confidence intervals
    const predictions = values.map((_, i) => intercept + slope * (i + 1));
    const residuals = values.map((v, i) => Math.pow(v - predictions[i], 2));
    const stdDev = Math.sqrt(residuals.reduce((a, b) => a + b, 0) / n);

    // Generate scenarios
    const lastDate = new Date(months[months.length - 1]);
    const scenarios = [];

    const scenarioTypes = [
      { name: 'Pessimista', factor: -0.2 },
      { name: 'Base', factor: 0 },
      { name: 'Otimista', factor: 0.2 }
    ];

    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i);
      const monthStr = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
      
      const point = {
        month: monthStr,
        historic: null
      };

      scenarioTypes.forEach(scenario => {
        const basePrediction = intercept + slope * (n + i);
        const adjusted = basePrediction * (1 + scenario.factor);
        point[scenario.name.toLowerCase()] = Math.max(0, Math.round(adjusted));
      });

      scenarios.push(point);
    }

    // Historic data
    const historicData = months.map((month, idx) => ({
      month,
      historic: values[idx],
      base: predictions[idx],
      pessimista: null,
      otimista: null
    }));

    const summary = {
      currentTrend: slope > 0 ? 'Crescimento' : 'Declínio',
      trendValue: Math.abs(slope),
      monthlyAverage: Math.round(sumY / n),
      next6MonthsBase: scenarios.reduce((sum, s) => sum + s.base, 0),
      volatility: Math.round((stdDev / (sumY / n)) * 100)
    };

    return {
      data: [...historicData, ...scenarios],
      summary
    };
  }, [invoices]);

  if (!forecasts.summary) {
    return <div className="text-center py-8 text-slate-500">Sem dados para previsão</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Tendência Atual</p>
              <div className="flex items-center gap-2 mt-1">
                {forecasts.summary.currentTrend === 'Crescimento' ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
                <span className="text-lg font-bold">{forecasts.summary.currentTrend}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                R$ {Math.round(forecasts.summary.trendValue).toLocaleString('pt-BR')}/mês
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Média Mensal</p>
              <p className="text-2xl font-bold mt-1">
                R$ {forecasts.summary.monthlyAverage.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-slate-500 mt-1">Histórico</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Previsão 6 Meses</p>
              <p className="text-2xl font-bold mt-1">
                R$ {(forecasts.summary.next6MonthsBase / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-slate-500 mt-1">Cenário Base</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Volatilidade</p>
              <p className="text-2xl font-bold mt-1">{forecasts.summary.volatility}%</p>
              <p className="text-xs text-slate-500 mt-1">Variação média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Previsão de Receita - 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecasts.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => value ? `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : '-'}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="historic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Histórico"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="base" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Previsão Base"
              />
              <Line 
                type="monotone" 
                dataKey="otimista" 
                stroke="#8b5cf6" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Cenário Otimista"
              />
              <Line 
                type="monotone" 
                dataKey="pessimista" 
                stroke="#f59e0b" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Cenário Pessimista"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Análise de Cenários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900">Cenário Otimista</p>
            <p className="text-xs text-green-700 mt-1">
              Crescimento de 20% mantido. Implementar estratégias de aquisição agressivas.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">Cenário Base</p>
            <p className="text-xs text-blue-700 mt-1">
              Manutenção da tendência atual. Focar em eficiência operacional.
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-amber-900">Cenário Pessimista</p>
            <p className="text-xs text-amber-700 mt-1">
              Queda de 20%. Planejar cortes de custos e otimizações de fluxo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}