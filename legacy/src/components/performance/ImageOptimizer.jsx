import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Image Optimizer - Otimiza imagens
 * Compression, formats, responsive images
 */
export default function ImageOptimizer() {
  const [compressionLevel, setCompressionLevel] = useState(70);

  const sampleImages = useMemo(() => [
    { id: 1, name: 'dashboard-hero.png', original: 245, optimized: 0 },
    { id: 2, name: 'chart-bg.jpg', original: 182, optimized: 0 },
    { id: 3, name: 'logo.svg', original: 12, optimized: 0 },
  ], []);

  const optimizedImages = useMemo(() => 
    sampleImages.map(img => ({
      ...img,
      optimized: Math.round(img.original * (1 - compressionLevel / 100))
    })),
    [compressionLevel, sampleImages]
  );

  const totalOriginal = sampleImages.reduce((sum, i) => sum + i.original, 0);
  const totalOptimized = optimizedImages.reduce((sum, i) => sum + i.optimized, 0);
  const savings = totalOriginal - totalOptimized;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold">Otimização de Imagens</h3>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Nível de Compressão: {compressionLevel}%</label>
          <input
            type="range"
            min="0"
            max="90"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          {optimizedImages.map(img => (
            <div key={img.id} className="p-3 bg-gray-50 rounded space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{img.name}</span>
                <span className="text-xs text-gray-600">
                  {img.original} KB → {img.optimized} KB
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div className="bg-red-500 h-2" style={{ width: '100%' }} />
                </div>
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div className="bg-green-500 h-2" style={{ width: `${(img.optimized / img.original) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-green-50 rounded border border-green-200 text-sm">
          <p className="font-medium text-green-800">Total: {totalOriginal} KB → {totalOptimized} KB</p>
          <p className="text-green-700">Economia: {savings} KB ({Math.round((savings / totalOriginal) * 100)}%)</p>
        </div>

        <Button className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Aplicar Otimizações
        </Button>
      </Card>
    </div>
  );
}