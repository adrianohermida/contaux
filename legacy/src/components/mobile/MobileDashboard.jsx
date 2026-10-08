import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

/**
 * Mobile Dashboard - Dashboard otimizado para mobile
 * Componentes compactos, touch-friendly, performance otimizada
 */
export default function MobileDashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clients, invoices] = await Promise.all([
          base44.entities.Client.list(),
          base44.entities.Invoice.list(),
        ]);

        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
        const pending = invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').length;

        setStats({
          totalClients: clients.length,
          totalInvoices: invoices.length,
          totalRevenue,
          pending,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { icon: Users, label: 'Clientes', value: stats.totalClients, color: 'bg-blue-100 text-blue-600' },
    { icon: FileText, label: 'Faturas', value: stats.totalInvoices, color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: 'Receita', value: `$${stats.totalRevenue.toFixed(0)}`, color: 'bg-purple-100 text-purple-600' },
    { icon: Activity, label: 'Pendentes', value: stats.pending, color: 'bg-orange-100 text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 pb-24">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4 touch-manipulation hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Atividade Recente</h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="pb-2 border-b last:border-b-0">
              <p className="text-sm font-medium">Evento {i + 1}</p>
              <p className="text-xs text-gray-500">Há 2 horas</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}