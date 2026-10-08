import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function LiveCharts({ data = [], metric = 'revenue', interval = 5000 }) {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    const timer = setInterval(() => {
      setChartData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          value: Math.random() * 100000 + 50000,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
        return [...prev.slice(-59), newPoint]; // Keep last 60 data points
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  const latestValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || latestValue;
  const change = ((latestValue - previousValue) / previousValue * 100).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {metric === 'revenue' ? 'Receita em Tempo Real' : 'Métrica em Tempo Real'}
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {metric === 'revenue' ? 'R$' : ''}{latestValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% vs último
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}