/**
 * QueryAnalyzer Component
 * SQL query analysis and optimization recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap, TrendingDown } from 'lucide-react';

export default function QueryAnalyzer() {
  const [selectedQuery, setSelectedQuery] = useState(null);

  const queries = [
    {
      id: 1,
      sql: 'SELECT * FROM users WHERE id = ?',
      time: 12,
      indexed: true,
      status: 'fast',
      recommendations: [],
    },
    {
      id: 2,
      sql: 'SELECT * FROM orders WHERE status = ?',
      time: 45,
      indexed: false,
      status: 'slow',
      recommendations: [
        'Add index on status column',
        'Specify only needed columns',
      ],
    },
    {
      id: 3,
      sql: 'SELECT COUNT(*) FROM products WHERE category IN (...)',
      time: 156,
      indexed: false,
      status: 'critical',
      recommendations: [
        'Add composite index on category',
        'Consider query caching',
        'Use materialized view',
      ],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'fast':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'slow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Query Analyzer</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {queries.length} Queries
        </Badge>
      </div>

      {/* Queries List */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Zap className="w-4 h-4" />
            Database Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setSelectedQuery(selectedQuery?.id === query.id ? null : query)}
              className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <code className="text-xs font-mono text-slate-800 dark:text-slate-100 truncate">
                    {query.sql}
                  </code>
                </div>
                <Badge className={getStatusColor(query.status)}>
                  {query.time}ms
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className={query.indexed ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-red-100 text-red-800 dark:bg-red-900'}>
                  {query.indexed ? 'Indexed' : 'No Index'}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {selectedQuery && selectedQuery.recommendations.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-100">
              <AlertCircle className="w-4 h-4" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedQuery.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-sm text-amber-900 dark:text-amber-100"
              >
                <TrendingDown className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {rec}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Query Details */}
      {selectedQuery && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Query Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">SQL</p>
              <code className="block mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-100 break-all">
                {selectedQuery.sql}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Execution Time</p>
                <p className="text-lg font-bold dark:text-slate-100">{selectedQuery.time}ms</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                <Badge className={getStatusColor(selectedQuery.status)}>
                  {selectedQuery.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}