/**
 * DataExportManager Component
 * Advanced data export with PDF support
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Clock } from 'lucide-react';

export default function DataExportManager() {
  const [exportFormat, setExportFormat] = useState('csv');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [exportHistory, setExportHistory] = useState([
    { id: 1, format: 'CSV', date: '2026-03-02', size: '2.4 MB', status: 'completed' },
    { id: 2, format: 'JSON', date: '2026-03-01', size: '3.1 MB', status: 'completed' },
  ]);

  const handleExport = () => {
    const newExport = {
      id: exportHistory.length + 1,
      format: exportFormat.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      size: Math.random() * 5 + 1,
      status: 'completed',
    };
    setExportHistory([newExport, ...exportHistory]);
  };

  const handleScheduleExport = () => {
    if (!scheduleEmail) {
      alert('Please enter an email address');
      return;
    }
    alert(
      `Export scheduled for ${scheduleFrequency} delivery to ${scheduleEmail}`
    );
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Data Export Manager</h2>
      </div>

      {/* Quick Export */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Quick Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Format
            </label>
            <div className="flex gap-2 flex-wrap">
              {['csv', 'json', 'pdf', 'excel'].map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    exportFormat === format
                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Now
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Export */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Scheduled Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Enable scheduled exports
            </label>
          </div>

          {scheduleEnabled && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Frequency
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setScheduleFrequency(freq)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        scheduleFrequency === freq
                          ? 'bg-blue-600 text-white dark:bg-blue-700'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <Button
                onClick={handleScheduleExport}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule Export
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exportHistory.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {exp.format} Export
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exp.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {exp.size}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {exp.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}