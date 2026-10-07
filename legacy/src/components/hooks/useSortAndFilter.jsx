import { useState, useCallback, useMemo } from 'react';

/**
 * Hook unificado para gerenciar estado de sort, filter e search
 * Reutilizável em todas as listas da aplicação
 */
export function useSortAndFilter(initialData = [], initialSort = 'name', initialDirection = 'asc') {
  const [sortField, setSortField] = useState(initialSort);
  const [sortDirection, setSortDirection] = useState(initialDirection);
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchFields, setSearchFields] = useState([]);

  // Toggle sort direction
  const toggleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Update single filter
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Update search config
  const configureSearch = useCallback((text, fields) => {
    setSearchText(text);
    setSearchFields(fields);
  }, []);

  // Apply all transformations
  const processedData = useMemo(() => {
    if (!Array.isArray(initialData)) return [];

    // Step 1: Filter by conditions
    let result = initialData.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value)) return value.includes(item[key]);
        if (typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(String(value).toLowerCase());
        }
        return item[key] === value;
      });
    });

    // Step 2: Search in multiple fields
    if (searchText && searchFields.length > 0) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (!value) return false;
          return String(value).toLowerCase().includes(lowerSearch);
        })
      );
    }

    // Step 3: Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
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
    }

    return result;
  }, [initialData, filters, searchText, searchFields, sortField, sortDirection]);

  return {
    // Data
    data: processedData,
    itemCount: processedData.length,
    totalCount: initialData.length,

    // Sort state
    sortField,
    sortDirection,
    toggleSort,

    // Filter state
    filters,
    setFilter,
    clearFilters,

    // Search state
    searchText,
    searchFields,
    configureSearch,
  };
}