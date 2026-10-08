import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ReportTable({ reportData, selectedTypes }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  return (
    <div className="space-y-6">
      {/* Faturas */}
      {selectedTypes.includes('invoices') && reportData.invoices?.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">📋 Faturas ({reportData.invoices.length})</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{inv.client_id?.substring(0, 8)}...</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(inv.total_amount)}</TableCell>
                    <TableCell>{formatDate(inv.issue_date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inv.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagamentos */}
      {selectedTypes.includes('payments') && reportData.payments?.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">✓ Pagamentos ({reportData.payments.length})</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.payments.map(pmt => (
                  <TableRow key={pmt.id}>
                    <TableCell className="font-semibold">{formatCurrency(pmt.amount)}</TableCell>
                    <TableCell>{formatDate(pmt.created_date)}</TableCell>
                    <TableCell>{pmt.payment_method || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {pmt.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Clientes */}
      {selectedTypes.includes('clients') && reportData.clients?.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">👥 Clientes ({reportData.clients.length})</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.clients.map(cli => (
                  <TableRow key={cli.id}>
                    <TableCell className="font-medium">{cli.company_name}</TableCell>
                    <TableCell>{cli.email}</TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold">
                        {cli.client_type === 'pf' ? 'PF' : 'PJ'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cli.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cli.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Transações */}
      {selectedTypes.includes('transactions') && reportData.transactions?.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">💰 Transações ({reportData.transactions.length})</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.transactions.map(trx => (
                  <TableRow key={trx.id}>
                    <TableCell>{trx.description}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(trx.amount)}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${
                        trx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trx.transaction_type}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(trx.transaction_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}