import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const statuses = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'sent', label: 'Enviado' },
  { value: 'paid', label: 'Pago' },
  { value: 'overdue', label: 'Vencido' },
  { value: 'cancelled', label: 'Cancelado' }
];

const categories = [
  { value: 'legal', label: 'Jurídico' },
  { value: 'accounting', label: 'Contabilidade' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'operational', label: 'Operacional' }
];

export default function ReportFiltersPanel({ filters, setFilters }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Todos os Status</option>
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Categoria</label>
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || null })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Todas as Categorias</option>
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Intervalo de Valores</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.valueRange?.[0] || 0}
              onChange={(e) => setFilters({
                ...filters,
                valueRange: [parseFloat(e.target.value), filters.valueRange?.[1] || 10000]
              })}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.valueRange?.[1] || 10000}
              onChange={(e) => setFilters({
                ...filters,
                valueRange: [filters.valueRange?.[0] || 0, parseFloat(e.target.value)]
              })}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
          </div>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={filters.valueRange?.[1] || 10000}
            onChange={(e) => setFilters({
              ...filters,
              valueRange: [filters.valueRange?.[0] || 0, parseFloat(e.target.value)]
            })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}