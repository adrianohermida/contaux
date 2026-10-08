/**
 * Unified Contact Import CSV Dialog
 * Import contacts from CSV with column mapping, validation, preview and mobile support
 * Replaces both ContactImportCSV and old ContactImportCSVDialog
 */

import React, { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FIELD_OPTIONS = [
  { value: 'company_name', label: 'Empresa/Nome' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'cpf', label: 'CPF' },
  { value: 'cep', label: 'CEP' },
  { value: 'endereco', label: 'Endereço' },
  { value: 'numero', label: 'Número' },
  { value: 'complemento', label: 'Complemento' },
  { value: 'bairro', label: 'Bairro' },
  { value: 'cidade', label: 'Cidade' },
  { value: 'uf', label: 'Estado' },
  { value: 'status', label: 'Status' },
  { value: 'client_type', label: 'Tipo (pf/pj)' },
];

export default function ContactImportCSVDialog({ open, onClose, workspaceId }) {
  const [csvData, setCsvData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [parsedRows, setParsedRows] = useState([]);
  const [step, setStep] = useState('upload'); // upload, mapping, preview, importing
  const [validationErrors, setValidationErrors] = useState({});
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async () => {
      const validContacts = parsedRows.filter(row => !validationErrors[row._index]);
      
      await Promise.all(
        validContacts.map(row => {
          const contact = { workspace_id: workspaceId };
          Object.entries(columnMapping).forEach(([csvCol, entityField]) => {
            if (entityField && row[csvCol]) {
              contact[entityField] = row[csvCol];
            }
          });
          return base44.entities.Client.create(contact);
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setCsvData(null);
      setColumnMapping({});
      setParsedRows([]);
      setValidationErrors({});
      setStep('upload');
      onClose();
    },
  });

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('CSV deve conter cabeçalho e pelo menos uma linha de dados');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const row = { _index: idx };
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    setCsvData(headers);
    setParsedRows(rows);
    
    // Auto-map if possible
    const autoMapping = {};
    headers.forEach(header => {
      const match = FIELD_OPTIONS.find(opt =>
        opt.label.toLowerCase().includes(header) || header.includes(opt.label.toLowerCase())
      );
      if (match) autoMapping[header] = match.value;
    });
    setColumnMapping(autoMapping);
    setStep('mapping');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        parseCSV(event.target?.result || '');
      } catch (error) {
        alert('Erro ao ler arquivo CSV');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const validateRows = () => {
    const errors = {};
    
    parsedRows.forEach((row, idx) => {
      const mappedContact = {};
      Object.entries(columnMapping).forEach(([csvCol, entityField]) => {
        if (entityField && row[csvCol]) {
          mappedContact[entityField] = row[csvCol];
        }
      });

      if (!mappedContact.company_name && !mappedContact.cpf && !mappedContact.cnpj) {
        errors[idx] = 'Nome ou documento (CPF/CNPJ) obrigatório';
      }
      if (mappedContact.email && !mappedContact.email.includes('@')) {
        errors[idx] = 'E-mail inválido';
      }
      if (mappedContact.cnpj && mappedContact.cnpj.replace(/\D/g, '').length !== 14) {
        errors[idx] = 'CNPJ deve conter 14 dígitos';
      }
      if (mappedContact.cpf && mappedContact.cpf.replace(/\D/g, '').length !== 11) {
        errors[idx] = 'CPF deve conter 11 dígitos';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 'mapping') {
      const isValid = validateRows();
      if (isValid) setStep('preview');
    }
  };

  const validRowCount = parsedRows.length - Object.keys(validationErrors).length;

  return (
    <AlertDialog open={open} onOpenChange={(val) => {
      if (!val) {
        setCsvData(null);
        setColumnMapping({});
        setParsedRows([]);
        setValidationErrors({});
        setStep('upload');
        onClose();
      }
    }}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {step === 'upload' && 'Importar Contatos'}
            {step === 'mapping' && 'Mapear Colunas'}
            {step === 'preview' && 'Revisar Dados'}
            {step === 'importing' && 'Importando...'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {step === 'upload' && 'Selecione um arquivo CSV para importar contatos'}
            {step === 'mapping' && `${parsedRows.length} linha(s) encontrada(s). Mapeie as colunas.`}
            {step === 'preview' && `${validRowCount} contato(s) será(ão) importado(s)`}
            {step === 'importing' && 'Importando contatos para o banco de dados...'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                aria-label="Upload arquivo CSV"
              />
              <label htmlFor="csv-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" aria-hidden="true" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Clique ou arraste um arquivo CSV</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Formato: empresa,email,telefone...</p>
              </label>
            </div>
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Mapeie as colunas do CSV:</p>
              {csvData?.map((header) => (
                <div key={header} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/20 rounded">
                  <label className="flex-1 text-sm text-slate-600 dark:text-slate-400 font-medium min-w-[120px]">
                    {header}
                  </label>
                  <Select
                    value={columnMapping[header] || ''}
                    onValueChange={(value) =>
                      setColumnMapping(prev => ({ ...prev, [header]: value }))
                    }
                  >
                    <SelectTrigger className="w-48 min-h-[44px]" aria-label={`Mapear coluna ${header}`}>
                      <SelectValue placeholder="Selecionar campo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Ignorar</SelectItem>
                      {FIELD_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {validRowCount > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p>{validRowCount} contato(s) pronto(s) para importar</p>
              </div>
            )}

            {Object.keys(validationErrors).length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="font-medium text-red-700 dark:text-red-300 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {Object.keys(validationErrors).length} erro(s) encontrado(s)
                </p>
                <ul className="space-y-1 text-xs text-red-600 dark:text-red-400">
                  {Object.entries(validationErrors).slice(0, 5).map(([idx, error]) => (
                    <li key={idx}>Linha {parseInt(idx) + 2}: {error}</li>
                  ))}
                  {Object.keys(validationErrors).length > 5 && (
                    <li>+{Object.keys(validationErrors).length - 5} erro(s) adicional(is)</li>
                  )}
                </ul>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {parsedRows.slice(0, 3).map((row, idx) => (
                <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900/20 rounded text-xs">
                  {validationErrors[idx] ? (
                    <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
                      <X className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{validationErrors[idx]}</span>
                    </div>
                  ) : (
                    <div className="text-green-600 dark:text-green-400 flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{row.company_name || row.email || 'Sem nome'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" aria-hidden="true" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Importando {validRowCount} contato(s)...
            </p>
          </div>
        )}

        <AlertDialogFooter>
          {step !== 'importing' && (
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          )}
          
          {step === 'upload' && (
            <Button
              variant="outline"
              disabled={!csvData}
              aria-label="Carregar arquivo CSV"
            >
              Carregar CSV
            </Button>
          )}

          {step === 'mapping' && (
            <AlertDialogAction onClick={handleNext} className="min-h-[44px]">
              Próximo
            </AlertDialogAction>
          )}

          {step === 'preview' && validRowCount > 0 && (
            <AlertDialogAction
              onClick={() => {
                setStep('importing');
                importMutation.mutate();
              }}
              disabled={importMutation.isPending}
              className="bg-green-600 hover:bg-green-700 min-h-[44px]"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Importando...
                </>
              ) : (
                'Importar'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}