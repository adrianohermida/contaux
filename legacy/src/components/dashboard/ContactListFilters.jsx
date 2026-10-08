import React, { useReducer } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.key]: action.value };
    case 'RESET_FILTERS':
      return { status: 'all', type: 'all', tag: 'all' };
    case 'TOGGLE_VISIBILITY':
      return { ...state, showFilters: !state.showFilters };
    default:
      return state;
  }
};

export default function ContactListFilters({ onFilterChange, tags = [] }) {
  const [state, dispatch] = useReducer(filterReducer, {
    status: 'all',
    type: 'all',
    tag: 'all',
    showFilters: false,
  });

  const handleFilterChange = (key, value) => {
    dispatch({ type: 'SET_FILTER', key, value });
    onFilterChange({ ...state, [key]: value });
  };

  const clearFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    onFilterChange({ status: 'all', type: 'all', tag: 'all' });
  };

  const activeCount = [state.status, state.type, state.tag].filter(v => v !== 'all').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => dispatch({ type: 'TOGGLE_VISIBILITY' })}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs font-semibold">
              {activeCount}
            </span>
          )}
        </Button>
        {activeCount > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-slate-400"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {state.showFilters && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'inactive'].map((value) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('status', value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    state.status === value
                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-300'
                  }`}
                >
                  {value === 'all' ? 'Todos' : value === 'active' ? 'Ativos' : 'Inativos'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tipo
            </label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pf', 'pj'].map((value) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('type', value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    state.type === value
                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-300'
                  }`}
                >
                  {value === 'all' ? 'Todos' : value === 'pf' ? 'PF' : 'PJ'}
                </button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tag
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleFilterChange('tag', 'all')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    state.tag === 'all'
                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-300'
                  }`}
                >
                  Todas
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleFilterChange('tag', tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                      state.tag === tag.id
                        ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}