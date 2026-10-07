import React, { useState } from 'react';
import { Zap, BarChart2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Compression Engine - Compressão de dados em cache
 */
export default function CompressionEngine() {
  const [compressionStats, setCompressionStats] = useState([
    {
      id: 1,
      entity: 'Invoices',
      original: 2048,
      compressed: 512,
      ratio: 75,
      algorithm: 'GZIP',
    },
    {
      id: 2,
      entity: 'Payments',
      original: 1536,
      compressed: 384,
      ratio: 75,
      algorithm: 'GZIP',
    },
    {
      id: 3,
      entity: 'Tickets',
      original: 3072,
      compressed: 768,
      ratio: 75,
      algorithm: 'DEFLATE',
    },
  ]);

  const compress = (data) => {
    // Simulação de compressão
    return Math.round(data * 0.25);
  };

  const totalOriginal = compressionStats.reduce((sum, s) => sum + s.original, 0);
  const totalCompressed = compressionStats.reduce((sum, s) => sum + s.compressed, 0);
  const avgRatio = Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100);
  const savedSpace = (totalOriginal - totalCompressed) / 1024;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-blue-50">
          <p className="text-xs text-gray-600">Original</p>
          <p className="text-2xl font-bold text-blue-900">{(totalOriginal / 1024).toFixed(1)}KB</p>
        </Card>
        <Card className="p-3 bg-green-50">
          <p className="text-xs text-gray-600">Comprimido</p>
          <p className="text-2xl font-bold text-green-900">{(totalCompressed / 1024).toFixed(1)}KB</p>
        </Card>
        <Card className="p-3 bg-purple-50">
          <p className="text-xs text-gray-600">Taxa Compressão</p>
          <p className="text-2xl font-bold text-purple-900">{avgRatio}%</p>
        </Card>
        <Card className="p-3 bg-orange-50">
          <p className="text-xs text-gray-600">Espaço Economizado</p>
          <p className="text-2xl font-bold text-orange-900">{savedSpace.toFixed(1)}KB</p>
        </Card>
      </div>

      <Button className="w-full">
        <Zap className="w-4 h-4 mr-2" />
        Comprimir Todos
      </Button>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Detalhes por Entidade</h3>
        <div className="space-y-3">
          {compressionStats.map(stat => (
            <div key={stat.id} className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm">{stat.entity}</p>
                  <p className="text-xs text-gray-600">{stat.algorithm}</p>
                </div>
                <span className="text-sm font-bold text-green-600">{stat.ratio}% reduzido</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <p className="text-gray-600">Original</p>
                  <p className="font-mono font-bold">{(stat.original / 1024).toFixed(2)}KB</p>
                </div>
                <div>
                  <p className="text-gray-600">Comprimido</p>
                  <p className="font-mono font-bold">{(stat.compressed / 1024).toFixed(2)}KB</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stat.ratio}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-blue-900">Otimização Ativa</p>
            <p className="text-xs text-blue-800">
              Compressão automática habilitada. Novos dados serão comprimidos usando GZIP por padrão.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}