/**
 * Duplicate Statistics
 * Dashboard de análise de duplicatas
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Users, TrendingUp } from 'lucide-react';

export default function DuplicateStats({ contacts = [], duplicates = [] }) {
  const stats = useMemo(() => {
    const total = contacts.length;
    const involved = new Set();
    
    duplicates.forEach(dup => {
      involved.add(dup.contact1.id);
      involved.add(dup.contact2.id);
    });

    return {
      totalContacts: total,
      totalDuplicates: duplicates.length,
      involvedContacts: involved.size,
      involvedPercent: total > 0 ? Math.round((involved.size / total) * 100) : 0,
      avgSimilarity: duplicates.length > 0
        ? Math.round(duplicates.reduce((sum, d) => sum + d.score, 0) / duplicates.length)
        : 0,
      severityData: [
        { name: 'Alta (>90%)', value: duplicates.filter(d => d.severity === 'high').length },
        { name: 'Média (70-90%)', value: duplicates.filter(d => d.severity === 'medium').length },
        { name: 'Baixa (<70%)', value: duplicates.filter(d => d.severity === 'low').length },
      ],
    };
  }, [contacts, duplicates]);

  const COLORS = ['#ef4444', '#eab308', '#3b82f6'];

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: '50-60%', count: 0 },
      { range: '60-70%', count: 0 },
      { range: '70-80%', count: 0 },
      { range: '80-90%', count: 0 },
      { range: '90%+', count: 0 },
    ];

    duplicates.forEach(dup => {
      if (dup.score < 60) ranges[0].count++;
      else if (dup.score < 70) ranges[1].count++;
      else if (dup.score < 80) ranges[2].count++;
      else if (dup.score < 90) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [duplicates]);

  return (
    <div className="space-y-6 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">Total Contatos</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalContacts}</p>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400">Duplicatas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalDuplicates}</p>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">Envolvidos</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.involvedContacts}
            <span className="text-xs ml-1">({stats.involvedPercent}%)</span>
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-400">Similaridade Média</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgSimilarity}%</p>
        </div>
      </div>

      {/* Charts */}
      {duplicates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Severity Distribution */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              Distribuição por Severidade
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              Distribuição de Scores
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Resumo:</strong> {stats.involvedContacts} contatos ({stats.involvedPercent}%) podem ser
          duplicatas com uma similaridade média de {stats.avgSimilarity}%. Recomenda-se revisar
          as duplicatas de alta severidade em primeiro lugar.
        </p>
      </div>
    </div>
  );
}