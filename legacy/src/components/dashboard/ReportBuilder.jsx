/**
 * Report Builder Component
 * Create and customize reports
 */

import React, { useState } from 'react';
import { useReportBuilder } from '../hooks/useReportBuilder';
import { useGlobalAuth } from '../auth/useGlobalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Eye, Save } from 'lucide-react';

export default function ReportBuilder() {
  const { workspaceId } = useGlobalAuth('internal');
  const {
    reportConfig,
    reportData,
    isLoading,
    updateConfig,
    addMetric,
    removeMetric,
    availableMetrics,
  } = useReportBuilder(workspaceId);

  const [previewMode, setPreviewMode] = useState(false);

  const handleExportPDF = () => {
    // Generate and download PDF
    console.log('Exporting to PDF...', reportData);
  };

  const handleExportCSV = () => {
    // Generate and download CSV
    console.log('Exporting to CSV...', reportData);
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Report Builder
        </h1>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="dark:border-slate-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Configuration
            </h2>

            {/* Report Name */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Report Name
              </label>
              <Input
                value={reportConfig.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="e.g., Monthly Sales Report"
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>

            {/* Report Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Report Type
              </label>
              <Select
                value={reportConfig.type}
                onValueChange={(value) => updateConfig({ type: value })}
              >
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700">
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Group By
              </label>
              <Select
                value={reportConfig.groupBy}
                onValueChange={(value) => updateConfig({ groupBy: value })}
              >
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700">
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Charts */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeCharts"
                checked={reportConfig.includeCharts}
                onCheckedChange={(checked) =>
                  updateConfig({ includeCharts: checked })
                }
              />
              <label
                htmlFor="includeCharts"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Include Charts
              </label>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="flex-1 dark:border-slate-600"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex-1 dark:border-slate-600"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Select Metrics
            </h2>

            {/* Group by category */}
            {['Financial', 'Customer', 'Sales'].map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase">
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableMetrics
                    .filter((m) => m.category === category)
                    .map((metric) => (
                      <div key={metric.id} className="flex items-center gap-2">
                        <Checkbox
                          id={metric.id}
                          checked={reportConfig.metrics.includes(metric.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addMetric(metric.id);
                            } else {
                              removeMetric(metric.id);
                            }
                          }}
                        />
                        <label
                          htmlFor={metric.id}
                          className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          {metric.label}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {/* Report Preview */}
            {previewMode && reportConfig.metrics.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Preview
                </h3>
                {isLoading ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Loading report data...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(reportData.summary || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-3 bg-slate-50 dark:bg-slate-700 rounded text-sm"
                      >
                        <div className="text-slate-600 dark:text-slate-400">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {typeof value === 'number'
                            ? value.toLocaleString('pt-BR')
                            : value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}