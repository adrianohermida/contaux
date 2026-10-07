import React, { useState, useMemo } from 'react';
import { Layers, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Cluster Analyzer - Agrupa dados em clusters
 * K-means clustering, análise de padrões
 */
export default function ClusterAnalyzer({ data = [] }) {
  const [numClusters, setNumClusters] = useState(3);
  const [clusters, setClusters] = useState([]);

  const sampleData = useMemo(() => [
    { id: 1, x: 10, y: 20, value: 100 },
    { id: 2, x: 15, y: 25, value: 120 },
    { id: 3, x: 12, y: 22, value: 110 },
    { id: 4, x: 80, y: 85, value: 800 },
    { id: 5, x: 82, y: 87, value: 810 },
    { id: 6, x: 85, y: 90, value: 820 },
    { id: 7, x: 50, y: 55, value: 450 },
    { id: 8, x: 52, y: 57, value: 460 },
  ], []);

  const performClustering = () => {
    const clusterList = Array(numClusters).fill(0).map((_, i) => ({
      id: i,
      center: { x: Math.random() * 100, y: Math.random() * 100 },
      points: [],
      color: `hsl(${(i * 360) / numClusters}, 70%, 60%)`
    }));

    // Simula k-means
    sampleData.forEach(point => {
      let closestCluster = 0;
      let minDist = Infinity;

      clusterList.forEach((cluster, idx) => {
        const dist = Math.hypot(point.x - cluster.center.x, point.y - cluster.center.y);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = idx;
        }
      });

      clusterList[closestCluster].points.push(point);
    });

    setClusters(clusterList.filter(c => c.points.length > 0));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Análise de Clusters</h3>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Número de Clusters:</label>
          <input
            type="range"
            min="2"
            max="5"
            value={numClusters}
            onChange={(e) => setNumClusters(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-bold">{numClusters}</span>
        </div>

        <Button onClick={performClustering} className="w-full">
          <Zap className="w-4 h-4 mr-2" />
          Executar K-means
        </Button>
      </Card>

      <div className="space-y-2">
        {clusters.length > 0 ? (
          clusters.map(cluster => (
            <Card key={cluster.id} className="p-3" style={{ borderLeftColor: cluster.color, borderLeftWidth: '4px' }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Cluster {cluster.id + 1}</p>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{cluster.points.length} pontos</span>
                </div>
                <p className="text-xs text-gray-600">
                  Centro: ({cluster.center.x.toFixed(1)}, {cluster.center.y.toFixed(1)})
                </p>
                <div className="flex flex-wrap gap-1">
                  {cluster.points.map(point => (
                    <span key={point.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      P{point.id}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-center text-gray-500 text-sm">
            Nenhum cluster criado. Clique em "Executar K-means" para analisar.
          </Card>
        )}
      </div>
    </div>
  );
}