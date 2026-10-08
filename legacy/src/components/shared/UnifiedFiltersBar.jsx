/**
 * UNIFIED FILTERS BAR
 * Advanced search and filters with full-text and faceted navigation
 */

import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UnifiedFiltersBar({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
  additionalFilters = [] // Array of {key, label, options}
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

  const handleClearFilters = () => {
    onSearchChange('');
    onFiltersChange(Object.keys(filters).reduce((acc, key) => ({ ...acc, [key]: 'all' }), {}));
  };

  return (
    <div className="space-y-[var(--spacing-md)]" role="search" aria-label="Filtros e busca avançada">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-[var(--spacing-sm)] top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-foreground-muted)] pointer-events-none flex-shrink-0" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Buscar por nome, email, telefone..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-[var(--spacing-lg)] pr-[var(--spacing-md)] min-h-[44px] text-[var(--font-size-base)] sm:text-[var(--font-size-sm)]"
          aria-label="Campo de busca por nome, email ou telefone"
          autoComplete="off"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-[var(--spacing-sm)] sm:gap-[var(--spacing-md)]">
        {/* Status Filter */}
        <fieldset className="flex items-center gap-2 border-0">
          <legend className="sr-only">Filtrar por status</legend>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="px-[var(--spacing-sm)] py-[var(--spacing-xs)] min-h-[44px] border border-[var(--color-border-default)] rounded-md bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            aria-label="Filtrar por status"
          >
            <option value="all">Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </fieldset>

        {/* Additional Filters */}
        {additionalFilters.slice(0, 2).map(filter => (
          <fieldset key={filter.key} className="flex items-center gap-[var(--spacing-sm)] border-0">
            <legend className="sr-only">Filtrar por {filter.label}</legend>
            <select
              value={filters[filter.key] || 'all'}
              onChange={(e) => onFiltersChange({ ...filters, [filter.key]: e.target.value })}
              className="px-[var(--spacing-sm)] py-[var(--spacing-xs)] min-h-[44px] border border-[var(--color-border-default)] rounded-md bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              aria-label={`Filtrar por ${filter.label}`}
            >
              <option value="all">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </fieldset>
        ))}

        {/* Sort Controls - Hide on mobile, show on desktop */}
        <fieldset className="hidden sm:flex items-center gap-[var(--spacing-sm)] border-0">
          <legend className="sr-only">Ordenar</legend>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value, sortOrder)}
            className="px-[var(--spacing-sm)] py-[var(--spacing-xs)] min-h-[44px] border border-[var(--color-border-default)] rounded-md bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] text-[var(--font-size-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            aria-label="Ordenar por"
          >
            <option value="created_date">Data</option>
            <option value="company_name">Nome</option>
            <option value="status">Status</option>
          </select>

          <button
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-[var(--spacing-xs)] min-h-[44px] border border-[var(--color-border-default)] rounded-md text-[var(--font-size-sm)] hover:bg-[var(--color-background-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            aria-label={`Ordem: ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
            aria-pressed={sortOrder === 'desc'}
            title={sortOrder === 'asc' ? 'Clique para descendente' : 'Clique para ascendente'}
          >
            <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </fieldset>

        {/* Advanced Filters Toggle & Clear */}
        <div className="flex gap-[var(--spacing-sm)] ml-auto">
          {activeFiltersCount > 0 && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="min-h-[44px] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]"
              aria-label={`Limpar ${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} ativo${activeFiltersCount > 1 ? 's' : ''}`}
            >
              <X className="w-4 h-4 mr-[var(--spacing-xs)] flex-shrink-0" aria-hidden="true" />
              Limpar
            </Button>
          )}
          {additionalFilters.length > 2 && (
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant={showAdvanced ? 'default' : 'outline'}
              size="sm"
              className="min-h-[44px] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]"
              aria-expanded={showAdvanced}
              aria-label="Alternar entre filtros básicos e avançados"
            >
              <Filter className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline ml-[var(--spacing-xs)]">Filtros</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && additionalFilters.length > 2 && (
        <div className="p-[var(--spacing-md)] bg-[var(--color-background-secondary)] border border-[var(--color-border-default)] rounded-lg space-y-[var(--spacing-sm)]">
          <h3 className="text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]">Filtros Avançados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-sm)]">
            {additionalFilters.slice(2).map(filter => (
              <fieldset key={filter.key} className="flex flex-col gap-[var(--spacing-sm)] border-0">
                <legend className="text-[var(--font-size-xs)] font-medium text-[var(--color-foreground-secondary)]">{filter.label}</legend>
                <select
                  value={filters[filter.key] || 'all'}
                  onChange={(e) => onFiltersChange({ ...filters, [filter.key]: e.target.value })}
                  className="px-[var(--spacing-sm)] py-[var(--spacing-xs)] min-h-[44px] border border-[var(--color-border-default)] rounded-md bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] text-[var(--font-size-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                  aria-label={`Filtrar por ${filter.label}`}
                >
                  <option value="all">Todos</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </fieldset>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}