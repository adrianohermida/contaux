import { useMemo, useCallback } from 'react';

/**
 * Hook que abstrai lógica de filtro e ordenação
 * Reutilizável em múltiplas listas (contatos, invoices, quotes, etc)
 */
export function useFilterService(data = [], filters = {}, sortField = null, sortDirection = 'asc', searchText = '', searchFields = []) {
  // Filtrar por condições
  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value)) return value.includes(item[key]);
        if (typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(String(value).toLowerCase());
        }
        return item[key] === value;
      });
    });
  }, [data, filters]);

  // Buscar em múltiplos campos
  const searched = useMemo(() => {
    if (!searchText || !Array.isArray(searchFields) || searchFields.length === 0) {
      return filtered;
    }
    
    const lowerSearch = searchText.toLowerCase();
    return filtered.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [filtered, searchText, searchFields]);

  // Ordenar
  const sorted = useMemo(() => {
    if (!sortField) return searched;
    
    return [...searched].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
  }, [searched, sortField, sortDirection]);

  // Agrupar por campo (útil para resumos)
  const groupByField = useCallback((field) => {
    return sorted.reduce((groups, item) => {
      const key = item[field] || 'N/A';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [sorted]);

  // Paginar resultados
  const paginate = useCallback((page = 1, pageSize = 10) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = sorted.slice(start, end);
    const total = sorted.length;
    const pages = Math.ceil(total / pageSize);
    
    return { items, total, pages, currentPage: page };
  }, [sorted]);

  return {
    data: sorted,
    filtered: filtered.length,
    total: data.length,
    groupByField,
    paginate
  };
}