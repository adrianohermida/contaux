import React, { useState } from 'react';
import { Settings, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AVAILABLE_WIDGETS = [
  { id: 'revenue', name: 'Receita Total', category: 'financial' },
  { id: 'expenses', name: 'Despesas Totais', category: 'financial' },
  { id: 'profit', name: 'Lucro Líquido', category: 'financial' },
  { id: 'invoices', name: 'Faturas Pendentes', category: 'sales' },
  { id: 'clients', name: 'Clientes Ativos', category: 'crm' },
  { id: 'processes', name: 'Processos em Andamento', category: 'legal' },
  { id: 'alerts', name: 'Alertas Importantes', category: 'system' },
  { id: 'tasks', name: 'Tarefas do Dia', category: 'productivity' }
];

export default function DashboardCustomizer({ onSave }) {
  const [widgets, setWidgets] = useState([
    { id: 'revenue', visible: true },
    { id: 'expenses', visible: true },
    { id: 'invoices', visible: true }
  ]);

  const availableToAdd = AVAILABLE_WIDGETS.filter(
    w => !widgets.find(widget => widget.id === w.id)
  );

  const handleAddWidget = (widgetId) => {
    setWidgets([...widgets, { id: widgetId, visible: true }]);
  };

  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleToggleVisibility = (widgetId) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const handleReorder = (index, direction) => {
    const newWidgets = [...widgets];
    if (direction === 'up' && index > 0) {
      [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]];
    } else if (direction === 'down' && index < newWidgets.length - 1) {
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    }
    setWidgets(newWidgets);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Personalizar Dashboard</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Widgets Adicionados */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-lg">Widgets Exibidos</h3>
          {widgets.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum widget configurado</p>
          ) : (
            <div className="space-y-2">
              {widgets.map((widget, idx) => {
                const widgetInfo = AVAILABLE_WIDGETS.find(w => w.id === widget.id);
                return (
                  <div key={widget.id} className="flex items-center gap-2 bg-slate-50 p-3 rounded border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{widgetInfo?.name}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(widget.id)}
                      title={widget.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {widget.visible ? (
                        <Eye className="w-4 h-4 text-blue-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Widgets Disponíveis */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-lg">Adicionar Widgets</h3>
          {availableToAdd.length === 0 ? (
            <p className="text-sm text-slate-500">Todos os widgets estão adicionados</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableToAdd.map(widget => (
                <Button
                  key={widget.id}
                  onClick={() => handleAddWidget(widget.id)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  {widget.name}
                  <Plus className="w-4 h-4" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button onClick={() => onSave?.(widgets)} className="w-full bg-blue-600 hover:bg-blue-700">
        Salvar Personalização
      </Button>
    </div>
  );
}