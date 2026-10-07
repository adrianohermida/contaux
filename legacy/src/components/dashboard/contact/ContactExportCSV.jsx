/**
 * Unified Contact Export CSV
 * Export contacts to CSV with column selection, formatting, and mobile support
 * Replaces both ContactExportButton and old ContactExportCSV
 */

import React, { useState, useCallback } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

const AVAILABLE_COLUMNS = [
  { key: 'company_name', label: 'Empresa/Nome', default: true },
  { key: 'client_type', label: 'Tipo (PF/PJ)', default: true },
  { key: 'email', label: 'E-mail', default: true },
  { key: 'phone', label: 'Telefone', default: true },
  { key: 'cnpj', label: 'CNPJ', default: false },
  { key: 'cpf', label: 'CPF', default: false },
  { key: 'cep', label: 'CEP', default: false },
  { key: 'cidade', label: 'Cidade', default: false },
  { key: 'uf', label: 'Estado', default: false },
  { key: 'status', label: 'Status', default: true },
  { key: 'created_date', label: 'Data de Criação', default: false },
  { key: 'created_by', label: 'Criado por', default: false },
];

export default function ContactExportCSV({ contacts = [], workspaceId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    AVAILABLE_COLUMNS.filter(c => c.default).map(c => c.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Prepare CSV headers
      const headers = AVAILABLE_COLUMNS
        .filter(col => selectedColumns.includes(col.key))
        .map(col => col.label);

      // Prepare CSV rows
      const rows = contacts.map(contact => 
        AVAILABLE_COLUMNS
          .filter(col => selectedColumns.includes(col.key))
          .map(col => {
            const value = contact[col.key];
            // Escape quotes and wrap in quotes if contains comma
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
      );

      // Combine headers and rows
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contatos-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erro ao exportar contatos');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleColumn = (key) => {
    setSelectedColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="gap-2 min-h-[44px]"
        aria-label="Exportar contatos para CSV"
        disabled={contacts.length === 0}
      >
        <Download className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Exportar CSV</span>
        <span className="sm:hidden">Exportar</span>
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar Contatos</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione as colunas para exportar. {contacts.length} contato(s) será(ão) exportado(s).
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 max-h-64 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
            {AVAILABLE_COLUMNS.map(column => (
              <label
                key={column.key}
                className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                  aria-label={`Incluir coluna ${column.label}`}
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  {column.label}
                </span>
              </label>
            ))}
          </div>

          {selectedColumns.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p>Selecione ao menos uma coluna para exportar</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExport}
              disabled={selectedColumns.length === 0 || isExporting}
              className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Exportar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}