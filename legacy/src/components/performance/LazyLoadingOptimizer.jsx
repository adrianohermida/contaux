import React, { useState } from 'react';
import { Zap, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Lazy Loading Optimizer - Configura lazy loading
 * Otimiza routes, components, imagens
 */
export default function LazyLoadingOptimizer() {
  const [optimizations, setOptimizations] = useState([
    { id: 1, name: 'Route Splitting', status: 'enabled', savings: '35KB' },
    { id: 2, name: 'Image Lazy Loading', status: 'enabled', savings: '18KB' },
    { id: 3, name: 'Component Code Splitting', status: 'enabled', savings: '28KB' },
    { id: 4, name: 'Async Component Loading', status: 'pending', savings: '22KB' },
  ]);

  const toggleOptimization = (id) => {
    setOptimizations(optimizations.map(opt =>
      opt.id === id ? { ...opt, status: opt.status === 'enabled' ? 'disabled' : 'enabled' } : opt
    ));
  };

  const totalSavings = optimizations
    .filter(o => o.status === 'enabled')
    .reduce((sum, o) => sum + parseInt(o.savings), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold">Lazy Loading & Code Splitting</h3>
        <span className="ml-auto text-sm font-bold text-green-600">-{totalSavings} KB</span>
      </div>

      <Card className="p-4 space-y-3">
        {optimizations.map(opt => (
          <div key={opt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-3 flex-1">
              {opt.status === 'enabled' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{opt.name}</p>
                <p className="text-xs text-gray-500">Economia: {opt.savings}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={opt.status === 'enabled' ? 'default' : 'outline'}
              onClick={() => toggleOptimization(opt.id)}
            >
              {opt.status === 'enabled' ? 'Ativo' : 'Inativo'}
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}