import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Data Validator - Valida integridade dos dados
 */
export default function DataValidator() {
  const [validationResults, setValidationResults] = useState([
    { id: 1, entity: 'Invoice', total: 150, valid: 148, invalid: 2, status: 'warning' },
    { id: 2, entity: 'Payment', total: 85, valid: 85, invalid: 0, status: 'success' },
    { id: 3, entity: 'Ticket', total: 220, valid: 215, invalid: 5, status: 'warning' },
  ]);

  const runValidation = () => {
    console.log('Executando validação de dados...');
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-yellow-600" />
    );
  };

  const totalValid = validationResults.reduce((sum, r) => sum + r.valid, 0);
  const totalInvalid = validationResults.reduce((sum, r) => sum + r.invalid, 0);
  const totalValidityRate = Math.round((totalValid / (totalValid + totalInvalid)) * 100);

  return (
    <div className="space-y-3 md:space-y-4">
      <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-700 flex-shrink-0" />
          <p className="font-semibold text-blue-900">Taxa de Integridade</p>
        </div>
        <div className="flex items-end gap-3 md:gap-4">
          <div className="flex-shrink-0">
            <p className="text-2xl md:text-3xl font-bold text-blue-900">{totalValidityRate}%</p>
            <p className="text-xs md:text-sm text-blue-700">{totalValid} de {totalValid + totalInvalid}</p>
          </div>
          <div className="flex-1 bg-blue-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-3 rounded-full transition-all"
              style={{ width: `${totalValidityRate}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-2 md:space-y-3">
        {validationResults.map(result => {
          const validPercent = Math.round((result.valid / result.total) * 100);
          return (
            <Card key={result.id} className={`p-2 md:p-3 ${validPercent === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(result.status)}
                  <p className="font-semibold text-slate-900 text-xs md:text-sm">{result.entity}</p>
                </div>
                <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded flex-shrink-0 ${validPercent === 100 ? 'text-emerald-900 bg-emerald-200' : 'text-amber-900 bg-amber-200'}`}>
                  {validPercent}%
                </span>
              </div>
              <div className="flex gap-2 md:gap-4 text-xs">
                <span className="text-emerald-700">✓ {result.valid} válidos</span>
                <span className="text-amber-700">✗ {result.invalid} inválidos</span>
              </div>
              <div className="flex gap-1 mt-2 h-1.5">
                <div
                  className="bg-emerald-600 rounded-full"
                  style={{ width: `${(result.valid / result.total) * 100}%` }}
                />
                <div
                  className="bg-amber-500 rounded-full"
                  style={{ width: `${(result.invalid / result.total) * 100}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}