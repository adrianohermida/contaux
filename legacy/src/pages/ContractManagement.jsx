import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export default function ContractManagement() {
  const [contracts] = useState([
    { id: 1, name: 'Contrato Cliente A', status: 'active', value: 'R$ 125k', expiry: '2026-12-31', renewal: '60 dias' },
    { id: 2, name: 'Contrato Fornecedor B', status: 'active', value: 'R$ 45k', expiry: '2026-06-15', renewal: '15 dias' },
    { id: 3, name: 'Contrato SLA C', status: 'pending', value: 'R$ 89k', expiry: '2026-03-30', renewal: 'Pendente' }
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Contract Management System</h1>
        <p className="text-slate-600">Gestão centralizada de contratos</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Contratos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">48</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Ativos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">42</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Valor Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ 4.2M</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Vencendo</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">3</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Contratos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{c.name}</span>
                <Badge className={c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {c.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div>Valor: {c.value}</div>
                <div>Vence: {c.expiry}</div>
                <div>Renovação: {c.renewal}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}