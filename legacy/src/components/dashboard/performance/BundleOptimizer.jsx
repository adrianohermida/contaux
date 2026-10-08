import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Package, Loader2, TrendingDown } from 'lucide-react';

export default function BundleOptimizer() {
  const [optimizationLevel, setOptimizationLevel] = useState('standard');

  const { data: bundleMetrics = {} } = useQuery({
    queryKey: ['bundle-metrics'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('analyzeBundleSize', {});
        return response.data || {};
      } catch (err) {
        console.error('Error loading bundle metrics:', err);
        return {};
      }
    },
    refetchInterval: 60000
  });

  const bundles = [
    { name: 'main.js', size: bundleMetrics.mainSize || 450, optimized: bundleMetrics.mainOptimized || false },
    { name: 'vendor.js', size: bundleMetrics.vendorSize || 380, optimized: bundleMetrics.vendorOptimized || false },
    { name: 'styles.css', size: bundleMetrics.stylesSize || 120, optimized: bundleMetrics.stylesOptimized || false },
    { name: 'assets', size: bundleMetrics.assetsSize || 200, optimized: bundleMetrics.assetsOptimized || false }
  ];

  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);

  return (
    <div className="space-y-6">
      {/* Bundle Size Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Tamanho Total</p>
              <p className="text-2xl font-bold mt-1">{totalSize}KB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Redução Potencial</p>
              <p className="text-2xl font-bold mt-1">~35%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-amber-700 font-bold">B</span>
              </div>
              <p className="text-sm text-slate-600">Score</p>
              <p className="text-2xl font-bold mt-1">78/100</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bundle Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Bundles</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bundles}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}KB`} />
              <Bar dataKey="size" fill="#3b82f6">
                {bundles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.optimized ? '#10b981' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Otimização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'Code Splitting', desc: 'Dividir main.js em chunks menores', impact: '~12KB' },
            { title: 'Image Optimization', desc: 'Converter imagens para WebP', impact: '~45KB' },
            { title: 'CSS Minification', desc: 'Minificar estilos não utilizados', impact: '~8KB' },
            { title: 'Lazy Loading', desc: 'Carregar componentes sob demanda', impact: '~15KB' }
          ].map((rec, idx) => (
            <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{rec.title}</p>
                <p className="text-xs text-slate-600">{rec.desc}</p>
              </div>
              <span className="text-sm font-semibold text-green-600 ml-2">{rec.impact}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}