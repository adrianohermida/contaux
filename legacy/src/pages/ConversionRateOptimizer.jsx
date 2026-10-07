import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConversionRateOptimizer() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Conversion Rate Optimizer</h1>
        <p className="text-slate-600">Otimizador de taxa de conversão</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Taxa Conversão</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">4.2%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Testes Rodando</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">5</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Melhorias</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">+18%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Receita Adicional</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">+$42k</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recomendações Ativas</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Simplificar formulário de checkout</span>
            <Badge className="bg-orange-100 text-orange-800">Potencial: +8%</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Adicionar social proof</span>
            <Badge className="bg-orange-100 text-orange-800">Potencial: +5%</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Melhorar copy de CTA</span>
            <Badge className="bg-green-100 text-green-800">Implementado: +4%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}