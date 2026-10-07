/**
 * Dashboard Customizer
 * Allow users to choose which widgets to show on their dashboard
 */

import React, { useState, useEffect } from 'react';
import { Settings2, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

const DEFAULT_WIDGETS = [
  { id: 'kpi_contacts', label: 'KPI - Contatos', enabled: true },
  { id: 'kpi_revenue', label: 'KPI - Receita', enabled: true },
  { id: 'kpi_pipeline', label: 'KPI - Pipeline', enabled: true },
  { id: 'kpi_conversion', label: 'KPI - Conversão', enabled: true },
  { id: 'predictive', label: 'Análise Preditiva (IA)', enabled: true },
  { id: 'contact_growth', label: 'Gráfico de Crescimento', enabled: true },
  { id: 'revenue_chart', label: 'Gráfico de Receita', enabled: true },
  { id: 'activity_feed', label: 'Feed de Atividades', enabled: true },
  { id: 'sales_pipeline', label: 'Pipeline de Vendas', enabled: true },
  { id: 'tag_distribution', label: 'Distribuição de Tags', enabled: false },
  { id: 'campaign_analytics', label: 'Análise de Campanhas', enabled: false },
  { id: 'loyalty_stats', label: 'Estatísticas de Fidelidade', enabled: false },
];

const STORAGE_KEY = 'dashboard_widget_config';

export function useDashboardConfig() {
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const isEnabled = (widgetId) =>
    widgets.find(w => w.id === widgetId)?.enabled ?? true;

  const saveConfig = (newWidgets) => {
    setWidgets(newWidgets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
  };

  return { widgets, isEnabled, saveConfig };
}

export default function DashboardCustomizer() {
  const { widgets, saveConfig } = useDashboardConfig();
  const [localWidgets, setLocalWidgets] = useState(widgets);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets, open]);

  const toggleWidget = (id) => {
    setLocalWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const handleSave = () => {
    saveConfig(localWidgets);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  const enabledCount = localWidgets.filter(w => w.enabled).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-h-[40px]"
          aria-label="Personalizar dashboard"
        >
          <Settings2 className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Personalizar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-slate-900 dark:text-slate-100">
            Personalizar Dashboard
          </SheetTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {enabledCount} widget{enabledCount !== 1 ? 's' : ''} ativo{enabledCount !== 1 ? 's' : ''}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {localWidgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {widget.enabled ? (
                  <Eye className="w-4 h-4 text-blue-500" aria-hidden="true" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" aria-hidden="true" />
                )}
                <span className={`text-sm ${widget.enabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
                  {widget.label}
                </span>
              </div>
              <Switch
                checked={widget.enabled}
                onCheckedChange={() => toggleWidget(widget.id)}
                aria-label={`${widget.enabled ? 'Desativar' : 'Ativar'} ${widget.label}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            className="w-full gap-2 min-h-[44px]"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            {saved ? 'Salvo!' : 'Salvar Configurações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}