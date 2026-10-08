import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';

export default function TaxCalculation() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Tax Calculation</h1>
        <p className="text-slate-600">Cálculo avançado de impostos</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Jurisdições</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">27</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Regras Fiscais</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">156</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Transações</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">2.4k</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Acurácia</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">99.8%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Tipos de Imposto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 border rounded">
            <span>ICMS</span>
            <Badge variant="outline">18%</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>PIS</span>
            <Badge variant="outline">1.65%</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>COFINS</span>
            <Badge variant="outline">7.6%</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>ISS</span>
            <Badge variant="outline">5%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}