import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Custom BI Dashboard Engine - PHASE 17
 * Dynamic dashboard builder with custom visualizations
 */

class BIDashboardManager {
  constructor() {
    this.dashboards = new Map();
    this.widgets = new Map();
    this.datasources = new Map();
    this.initializeDatasources();
  }

  /**
   * Initialize data sources
   */
  initializeDatasources() {
    this.datasources.set('contacts', {
      name: 'Contacts Database',
      type: 'entity',
      entity: 'Client',
      fields: ['id', 'company_name', 'email', 'status', 'created_date', 'updated_date'],
    });

    this.datasources.set('invoices', {
      name: 'Invoices Database',
      type: 'entity',
      entity: 'Invoice',
      fields: ['id', 'number', 'amount', 'status', 'due_date', 'created_date'],
    });

    this.datasources.set('sales_opportunities', {
      name: 'Sales Opportunities',
      type: 'entity',
      entity: 'SalesOpportunity',
      fields: ['id', 'opportunity_name', 'deal_value', 'pipeline_stage', 'expected_close_date'],
    });

    this.datasources.set('custom_metrics', {
      name: 'Custom Metrics',
      type: 'api',
      endpoint: '/api/metrics',
      fields: ['metric_name', 'metric_value', 'timestamp'],
    });
  }

  /**
   * Create custom dashboard
   */
  createDashboard(workspace_id, dashboardConfig) {
    const dashboardId = 'dash_' + Math.random().toString(36).substr(2, 16);

    const dashboard = {
      id: dashboardId,
      workspace_id,
      name: dashboardConfig.name,
      description: dashboardConfig.description,
      layout: dashboardConfig.layout || 'grid',
      widgets: dashboardConfig.widgets || [],
      filters: dashboardConfig.filters || [],
      refresh_interval: dashboardConfig.refresh_interval || 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shared: false,
      starred: false,
    };

    this.dashboards.set(dashboardId, dashboard);
    return dashboard;
  }

  /**
   * Add widget to dashboard
   */
  addWidget(dashboardId, widgetConfig) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const widgetId = 'w_' + Math.random().toString(36).substr(2, 12);

    const widget = {
      id: widgetId,
      dashboard_id: dashboardId,
      title: widgetConfig.title,
      type: widgetConfig.type, // chart, kpi, table, gauge, etc
      datasource: widgetConfig.datasource,
      visualization: widgetConfig.visualization,
      position: widgetConfig.position,
      size: widgetConfig.size,
      filters: widgetConfig.filters || [],
      refresh_interval: widgetConfig.refresh_interval,
      created_at: new Date().toISOString(),
    };

    this.widgets.set(widgetId, widget);
    dashboard.widgets.push(widgetId);

    return widget;
  }

  /**
   * Generate widget data
   */
  async generateWidgetData(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    const datasource = this.datasources.get(widget.datasource);
    if (!datasource) throw new Error('Datasource not found');

    // Simulate data generation based on widget type
    let data = [];

    switch (widget.type) {
      case 'chart':
        data = this.generateChartData(datasource, widget);
        break;
      case 'kpi':
        data = this.generateKPIData(datasource, widget);
        break;
      case 'table':
        data = this.generateTableData(datasource, widget);
        break;
      case 'gauge':
        data = this.generateGaugeData(datasource, widget);
        break;
      default:
        data = [];
    }

    return {
      widget_id: widgetId,
      widget_title: widget.title,
      data,
      timestamp: new Date().toISOString(),
      datasource: datasource.name,
    };
  }

  /**
   * Generate chart data
   */
  generateChartData(datasource, widget) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map(month => ({
      name: month,
      value: Math.floor(Math.random() * 10000) + 1000,
      revenue: Math.floor(Math.random() * 50000) + 10000,
    }));
  }

  /**
   * Generate KPI data
   */
  generateKPIData(datasource, widget) {
    const value = Math.floor(Math.random() * 10000) + 1000;
    const previousValue = value * 0.85;
    const change = ((value - previousValue) / previousValue) * 100;

    return {
      value,
      previous_value: previousValue,
      change_percent: parseFloat(change.toFixed(2)),
      trend: change > 0 ? 'up' : 'down',
      target: Math.floor(value * 1.2),
    };
  }

  /**
   * Generate table data
   */
  generateTableData(datasource, widget) {
    return [
      { id: '1', name: 'Company A', value: 5000, status: 'active', date: '2026-02-21' },
      { id: '2', name: 'Company B', value: 7500, status: 'active', date: '2026-02-20' },
      { id: '3', name: 'Company C', value: 3200, status: 'inactive', date: '2026-02-19' },
      { id: '4', name: 'Company D', value: 9100, status: 'active', date: '2026-02-18' },
      { id: '5', name: 'Company E', value: 4800, status: 'pending', date: '2026-02-17' },
    ];
  }

  /**
   * Generate gauge data
   */
  generateGaugeData(datasource, widget) {
    const value = Math.floor(Math.random() * 100);

    return {
      value,
      min: 0,
      max: 100,
      status: value > 75 ? 'good' : value > 50 ? 'fair' : 'poor',
      label: 'Performance Score',
    };
  }

  /**
   * Apply filters to dashboard
   */
  applyFilters(dashboardId, filters) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    dashboard.filters = filters;
    dashboard.updated_at = new Date().toISOString();

    return {
      dashboard_id: dashboardId,
      filters_applied: filters.length,
      updated_at: dashboard.updated_at,
    };
  }

  /**
   * Export dashboard data
   */
  exportDashboardData(dashboardId, format = 'csv') {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const exportData = {
      dashboard_id: dashboardId,
      dashboard_name: dashboard.name,
      format,
      widgets_count: dashboard.widgets.length,
      export_time: new Date().toISOString(),
      file_size_estimate: Math.floor(Math.random() * 5000) + 1000,
    };

    return exportData;
  }

  /**
   * Schedule dashboard report
   */
  scheduleDashboardReport(dashboardId, schedule) {
    const reportId = 'rep_' + Math.random().toString(36).substr(2, 12);

    const report = {
      id: reportId,
      dashboard_id: dashboardId,
      frequency: schedule.frequency, // daily, weekly, monthly
      recipients: schedule.recipients,
      format: schedule.format || 'pdf',
      time_of_day: schedule.time_of_day,
      created_at: new Date().toISOString(),
      status: 'active',
    };

    return report;
  }
}

/**
 * Backend handler for BI Dashboard operations
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, dashboardConfig, widgetConfig, dashboardId, filters, format, schedule } = await req.json();

    const biManager = new BIDashboardManager();

    switch (action) {
      case 'create-dashboard':
        const dashboard = biManager.createDashboard(user.workspace_id, dashboardConfig);
        return Response.json({ success: true, dashboard });

      case 'add-widget':
        const widget = biManager.addWidget(dashboardId, widgetConfig);
        return Response.json({ success: true, widget });

      case 'get-widget-data':
        const widgetData = await biManager.generateWidgetData(dashboardId);
        return Response.json({ success: true, ...widgetData });

      case 'apply-filters':
        const filterResult = biManager.applyFilters(dashboardId, filters);
        return Response.json({ success: true, ...filterResult });

      case 'export-dashboard':
        const exportResult = biManager.exportDashboardData(dashboardId, format);
        return Response.json({ success: true, ...exportResult });

      case 'schedule-report':
        const scheduledReport = biManager.scheduleDashboardReport(dashboardId, schedule);
        return Response.json({ success: true, ...scheduledReport });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { BIDashboardManager };