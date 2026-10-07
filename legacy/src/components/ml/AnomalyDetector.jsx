import React, { useState, useMemo } from 'react';
import { AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Anomaly Detector - Detecta anomalias em dados
 * Machine Learning para outlier detection
 */
export default function AnomalyDetector({ data = [] }) {
  const [threshold, setThreshold] = useState(2.5);
  const [detectedAnomalies, setDetectedAnomalies] = useState([]);

  const sampleData = useMemo(() => [
    { id: 1, value: 1200, timestamp: new Date(Date.now() - 86400000), category: 'Revenue' },
    { id: 2, value: 1150, timestamp: new Date(Date.now() - 72000000), category: 'Revenue' },
    { id: 3, value: 1180, timestamp: new Date(Date.now() - 57600000), category: 'Revenue' },
    { id: 4, value: 5000, timestamp: new Date(Date.now() - 43200000), category: 'Revenue', anomaly: true },
    { id: 5, value: 1210, timestamp: new Date(Date.now() - 28800000), category: 'Revenue' },
    { id: 6, value: 1190, timestamp: new Date(Date.now() - 14400000), category: 'Revenue' },
    { id: 7, value: 1200, timestamp: new Date(), category: 'Revenue' },
  ], []);

  const calculateAnomalies = () => {
    const values = sampleData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = sampleData.filter(d => {
      const zScore = Math.abs((d.value - mean) / stdDev);
      return zScore > threshold;
    });

    setDetectedAnomalies(anomalies);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold">Detecção de Anomalias</h3>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Threshold Z-Score:</label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-bold">{threshold}</span>
        </div>

        <Button onClick={calculateAnomalies} className="w-full">
          <Activity className="w-4 h-4 mr-2" />
          Detectar Anomalias
        </Button>
      </Card>

      <div className="space-y-2">
        {detectedAnomalies.length > 0 ? (
          detectedAnomalies.map(anomaly => (
            <Card key={anomaly.id} className="p-3 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-4 h-4 text-orange-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{anomaly.category}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Valor: <span className="font-bold">{anomaly.value}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {anomaly.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-center text-gray-500 text-sm">
            Nenhuma anomalia detectada. Clique em "Detectar" para analisar.
          </Card>
        )}
      </div>
    </div>
  );
}