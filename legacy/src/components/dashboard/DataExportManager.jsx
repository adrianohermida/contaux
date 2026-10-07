/**
 * DataExportManager Component
 * Data export and integration management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle } from 'lucide-react';

export default function DataExportManager() {
  const [exports] = useState({
    totalExports: 342,
    successfulExports: 340,
    failedExports: 2,
    formats: ['CSV', 'JSON', 'Excel', 'PDF'],
  });

  const [recentExports] = useState([
    { id: 'exp_001', name: 'Q1 Sales Data', format: 'CSV', size: '12.5 MB', date: '2h ago' },
    { id: 'exp_002', name: 'Customer List', format: 'Excel', size: '8.3 MB', date: '4h ago' },
    { id: 'exp_003', name: 'Transaction Report', format: 'JSON', size: '15.7 MB', date: '1d ago' },
  ]);

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Data Export</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {exports.successfulExports}/{exports.totalExports} Success
        </Badge>
      </div>

      {/* Export Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Exports</p>
            <p className="text-2xl font-bold dark:text-slate-100">{exports.totalExports}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Successful</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {exports.successfulExports}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Failed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{exports.failedExports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Formats */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Supported Formats</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {exports.formats.map((format) => (
            <Badge key={format} className="bg-blue-100 text-blue-800 dark:bg-blue-900">
              {format}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Download className="w-4 h-4" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.map((exp) => (
              <div
                key={exp.id}
                className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{exp.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {exp.format} • {exp.size}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{exp.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Export Data</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Export to CSV</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Export to Excel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">Export to PDF</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Export to JSON</Button>
        </CardContent>
      </Card>
    </div>
  );
}