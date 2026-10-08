/**
 * APIVersionManager Component
 * API versioning and endpoint management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, CheckCircle, AlertCircle } from 'lucide-react';

export default function APIVersionManager() {
  const [versions] = useState([
    {
      version: 'v3',
      status: 'current',
      releaseDate: '2026-03-01',
      endpoints: 48,
      deprecation: null,
    },
    {
      version: 'v2',
      status: 'deprecated',
      releaseDate: '2025-09-15',
      endpoints: 42,
      deprecation: '2026-09-01',
    },
    {
      version: 'v1',
      status: 'legacy',
      releaseDate: '2025-01-20',
      endpoints: 35,
      deprecation: '2025-12-31',
    },
  ]);

  const [endpointMap] = useState([
    { endpoint: '/users', v1: '✓', v2: '✓', v3: '✓', changes: 'Minor' },
    { endpoint: '/products', v1: '✓', v2: '✓', v3: '✓', changes: 'Major' },
    { endpoint: '/orders', v1: '✓', v2: '✓', v3: '✓', changes: 'None' },
    { endpoint: '/analytics', v1: '✗', v2: '✓', v3: '✓', changes: 'New' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'deprecated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'legacy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">API Versions</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {versions.length} Versions
        </Badge>
      </div>

      {/* Version Timeline */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <GitBranch className="w-4 h-4" />
            Version Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {versions.map((v, idx) => (
            <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {v.status === 'current' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {v.status === 'deprecated' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                  <span className="font-bold text-slate-900 dark:text-slate-100">{v.version}</span>
                </div>
                <Badge className={getStatusColor(v.status)}>
                  {v.status.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div>Released: {new Date(v.releaseDate).toLocaleDateString()}</div>
                <div>Endpoints: {v.endpoints}</div>
                {v.deprecation && (
                  <div className="col-span-2 text-red-600 dark:text-red-400">
                    Sunset: {new Date(v.deprecation).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Endpoint Compatibility */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Endpoint Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Endpoint
                  </th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">v1</th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">v2</th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">v3</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {endpointMap.map((ep, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {ep.endpoint}
                    </td>
                    <td className="text-center py-2 px-3">{ep.v1}</td>
                    <td className="text-center py-2 px-3">{ep.v2}</td>
                    <td className="text-center py-2 px-3">{ep.v3}</td>
                    <td className="py-2 px-3">
                      <Badge
                        className={
                          ep.changes === 'New'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900'
                            : ep.changes === 'Major'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900'
                            : ep.changes === 'Minor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900'
                        }
                      >
                        {ep.changes}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Migration Guide */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">
            Migration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <p>
            <strong>V1 → V2:</strong> Update endpoint paths. Auth method changed from API key to OAuth.
          </p>
          <p>
            <strong>V2 → V3:</strong> Response format updated. New pagination style. Analytics endpoint added.
          </p>
          <p>
            <strong>Deprecation Timeline:</strong> V1 sunset Dec 2025, V2 sunset Sep 2026.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}