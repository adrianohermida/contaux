import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const pagesList = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'Balcão Virtual', path: 'virtualcounter' },
  { label: 'CRM - Clientes', path: 'clients' },
  { label: 'Helpdesk - Tickets', path: 'tickets' },
  { label: 'Processos Judiciais', path: 'legalprocesses' },
  { label: 'Faturamento', path: 'invoicing' },
  { label: 'Orçamentos', path: 'quotes' },
  { label: 'Vendas', path: 'sales' },
  { label: 'Pagamentos', path: 'payments' },
  { label: 'Fluxo de Caixa', path: 'cashflow' },
  { label: 'Relatórios & Análises', path: 'reports' },
  { label: 'Configurações', path: 'settings' }
];

export default function SearchBox({ query, onQueryChange, onSearch }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return pagesList.filter(p => p.label.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  return (
    <div className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Buscar página..."
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
          }`}
        />
        {query && (
          <button
            onClick={() => {
              onQueryChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-30 transition-colors ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600'
              : 'bg-white border-slate-300'
          }`}>
            {results.map((page) => (
              <a
                key={page.path}
                href={`/${page.path}`}
                className={`block px-4 py-2 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-200 hover:bg-slate-600'
                    : 'text-slate-900 hover:bg-slate-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {page.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}