import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Gera comparativo entre períodos (mês anterior vs atual)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json();
    const { tenantId } = body;

    if (!user || user.tenant_id !== tenantId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await base44.entities.Invoice.filter({ tenant_id: tenantId });
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const filterByMonth = (data, month, year) => {
      return data.filter(item => {
        const date = new Date(item.issue_date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    };

    const currentMonthData = filterByMonth(invoices, currentMonth, currentYear);
    const previousMonthData = filterByMonth(invoices, previousMonth, previousYear);

    const currentRevenue = currentMonthData.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const previousRevenue = previousMonthData.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentPaid = currentMonthData.filter(i => i.status === 'paid').length;
    const previousPaid = previousMonthData.filter(i => i.status === 'paid').length;
    const paidChange = previousPaid > 0 ? ((currentPaid - previousPaid) / previousPaid) * 100 : 0;

    return Response.json({
      currentMonth: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      previousMonth: new Date(previousYear, previousMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      comparison: {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: parseFloat(revenueChange.toFixed(2)),
          trend: revenueChange >= 0 ? 'up' : 'down'
        },
        paid: {
          current: currentPaid,
          previous: previousPaid,
          change: parseFloat(paidChange.toFixed(2)),
          trend: paidChange >= 0 ? 'up' : 'down'
        },
        invoicesCount: {
          current: currentMonthData.length,
          previous: previousMonthData.length
        }
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});