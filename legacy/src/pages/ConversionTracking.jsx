import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, Users, Zap } from 'lucide-react';

export default function ConversionTracking() {
  const [events] = useState([
    { id: 1, name: 'Blog View', count: 2450, conversion: 12.5 },
    { id: 2, name: 'Newsletter Signup', count: 180, conversion: 15.3 },
    { id: 3, name: 'Contact Form', count: 45, conversion: 25.0 },
    { id: 4, name: 'Download PDF', count: 320, conversion: 18.7 }
  ]);

  const conversionData = [
    { day: 'Seg', views: 450, conversions: 52, rate: 11.5 },
    { day: 'Ter', views: 520, conversions: 68, rate: 13.1 },
    { day: 'Qua', views: 480, conversions: 58, rate: 12.1 },
    { day: 'Qui', views: 610, conversions: 85, rate: 13.9 },
    { day: 'Sex', views: 720, conversions: 102, rate: 14.2 },
    { day: 'Sab', views: 380, conversions: 42, rate: 11.1 },
    { day: 'Dom', views: 290, conversions: 28, rate: 9.7 }
  ];

  const stats = useMemo(() => {
    const totalViews = events.reduce((sum, e) => sum + e.count, 0);
    const avgConversion = (events.reduce((sum, e) => sum + e.conversion, 0) / events.length).toFixed(2);
    return { totalViews, avgConversion };
  }, [events]);

  const funnelData = [
    { stage: 'Visitantes', value: 2450 },
    { stage: 'Engajados', value: 1835 },
    { stage: 'Interessados', value: 612 },
    { stage: 'Convertidos', value: 180 }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento de Conversão</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitore funis de conversão e pixel tracking</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConversion}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Rastreados</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">612</div>
            <p className="text-xs text-slate-600">essa semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="views" stroke="#3b82f6" name="Visualizações" />
              <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#10b981" name="Taxa %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Events Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eventos Rastreados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-slate-600">{event.count.toLocaleString('pt-BR')} eventos</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{event.conversion}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Code */}
      <Card>
        <CardHeader>
          <CardTitle>Pixel de Rastreamento</CardTitle>
          <CardDescription>Códigos para integração em seu site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Evento de Visualização</p>
            <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs overflow-x-auto">
{`<script>
  base44.analytics.track({
    eventName: 'page_view',
    properties: { page: 'blog' }
  });
</script>`}
            </pre>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Evento de Conversão</p>
            <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs overflow-x-auto">
{`<script>
  base44.analytics.track({
    eventName: 'conversion',
    properties: { type: 'lead' }
  });
</script>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}