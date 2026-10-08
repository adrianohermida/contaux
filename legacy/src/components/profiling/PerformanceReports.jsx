import React, { useState } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PerformanceReports() {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: 'Report - Feb 20, 2026',
      date: '2026-02-20',
      metrics: { fcp: '1.2s', lcp: '2.5s', bundle: '298KB', memory: '115MB' },
      score: 82,
    },
    {
      id: 2,
      name: 'Report - Feb 19, 2026',
      date: '2026-02-19',
      metrics: { fcp: '1.3s', lcp: '2.7s', bundle: '305KB', memory: '118MB' },
      score: 79,
    },
    {
      id: 3,
      name: 'Report - Feb 18, 2026',
      date: '2026-02-18',
      metrics: { fcp: '1.1s', lcp: '2.4s', bundle: '295KB', memory: '112MB' },
      score: 84,
    },
  ]);

  const generateReport = () => {
    const newReport = {
      id: reports.length + 1,
      name: `Report - ${new Date().toLocaleDateString('pt-BR')}`,
      date: new Date().toISOString().split('T')[0],
      metrics: { fcp: '1.2s', lcp: '2.5s', bundle: '298KB', memory: '115MB' },
      score: 82,
    };
    setReports([newReport, ...reports]);
  };

  const deleteReport = (id) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <Button onClick={generateReport} className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Gerar Novo Relatório
      </Button>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {reports.map(report => (
          <Card key={report.id} className="p-4 border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-sm text-slate-900">{report.name}</p>
                <p className="text-xs text-slate-500">{report.date}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">{report.score}</p>
                <p className="text-xs text-slate-500">score</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
              {Object.entries(report.metrics).map(([key, value]) => (
                <div key={key} className="p-2 bg-blue-50 rounded border border-blue-100">
                  <p className="text-blue-600 capitalize font-medium">{key}</p>
                  <p className="font-bold text-blue-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="w-3 h-3 mr-1" />
                Visualizar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteReport(report.id)}
                className="flex-1 text-red-600"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Deletar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}