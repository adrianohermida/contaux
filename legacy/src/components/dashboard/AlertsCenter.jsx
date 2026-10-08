import React, { useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Clock, DollarSign } from 'lucide-react';

const AlertsCenter = memo(function AlertsCenter({ tenantId }) {
  const { data: invoices = [] } = useQuery({
    queryKey: ['alerts-invoices', tenantId],
    queryFn: () => base44.entities.Invoice.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const alerts = useMemo(() => {
    const alertList = [];

    // Alerta: Faturas atrasadas
    const overdue = invoices.filter(i => i.status === 'overdue');
    if (overdue.length > 0) {
      alertList.push({
        id: 'overdue',
        type: 'error',
        title: 'Faturas Atrasadas',
        message: `${overdue.length} fatura(s) com pagamento atrasado`,
        icon: AlertCircle
      });
    }

    // Alerta: Faturas vencendo em breve
    const today = new Date();
    const upcoming = invoices.filter(i => {
      const dueDate = new Date(i.due_date);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue > 0;
    });
    if (upcoming.length > 0) {
      alertList.push({
        id: 'upcoming',
        type: 'warning',
        title: 'Faturas Vencendo',
        message: `${upcoming.length} fatura(s) vencendo nos próximos 7 dias`,
        icon: Clock
      });
    }

    // Alerta: Baixo recebimento
    const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paid_amount || 0), 0);
    const totalAmount = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const receivedRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
    
    if (receivedRate < 50) {
      alertList.push({
        id: 'low-received',
        type: 'warning',
        title: 'Taxa de Recebimento Baixa',
        message: `Apenas ${receivedRate.toFixed(0)}% das faturas foram recebidas`,
        icon: DollarSign
      });
    }

    return alertList;
  }, [invoices]);

  if (alerts.length === 0) return null;

  const colors = {
    error: 'bg-amber-50 border-amber-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const Icon = alert.icon;
        return (
          <div key={alert.id} className={`${colors[alert.type]} border rounded-lg p-4 flex gap-3`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${alert.type === 'error' ? 'text-amber-600' : 'text-yellow-600'}`} />
            <div>
              <p className="font-medium text-sm text-slate-900">{alert.title}</p>
              <p className="text-sm text-slate-600">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default AlertsCenter;