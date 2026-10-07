import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function StatMetric({ label, value, change, icon: Icon }) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-500'
          }`}>
            <ChangeIcon className="w-3 h-3" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactStatisticsWidget({ workspaceId }) {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts-stats', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // Cache 5 min
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Estatísticas de Contatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const total = contacts.length;
  const active = contacts.filter(c => c.status === 'active').length;
  const inactive = contacts.filter(c => c.status === 'inactive').length;
  
  // New this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = contacts.filter(c => new Date(c.created_date) >= startOfMonth).length;
  
  // Last month for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const newLastMonth = contacts.filter(c => {
    const created = new Date(c.created_date);
    return created >= startOfLastMonth && created <= endOfLastMonth;
  }).length;
  
  // Growth rate
  const growthRate = newLastMonth > 0 
    ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
    : newThisMonth > 0 ? 100 : 0;

  return (
    <Link to={createPageUrl('Contact')}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-600" />
            Estatísticas de Contatos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main stat */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <StatMetric 
              label="Total de Contatos" 
              value={total}
              change={growthRate}
            />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Ativos</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{active}</p>
              <p className="text-xs text-slate-500">{Math.round((active/total)*100)}%</p>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Inativos</p>
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{inactive}</p>
              <p className="text-xs text-slate-500">{Math.round((inactive/total)*100)}%</p>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Novos (mês)</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{newThisMonth}</p>
              <p className="text-xs text-slate-500">
                {newLastMonth > 0 ? `vs ${newLastMonth}` : 'Primeiro mês'}
              </p>
            </div>
          </div>

          {/* Quick insight */}
          {growthRate !== 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center pt-2 border-t">
              {growthRate > 0 
                ? `📈 Crescimento de ${growthRate}% vs mês anterior`
                : `📉 Redução de ${Math.abs(growthRate)}% vs mês anterior`
              }
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}