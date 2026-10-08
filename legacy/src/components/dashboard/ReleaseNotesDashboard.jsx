/**
 * ReleaseNotesDashboard Component
 * Release notes, changelog, and deployment status display
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  ChevronDown,
} from 'lucide-react';
import { useReleaseManager } from '@/components/hooks/useReleaseManager';

export default function ReleaseNotesDashboard() {
  const { releases, getDeploymentInfo } = useReleaseManager();
  const [expandedRelease, setExpandedRelease] = useState(releases[0]?.id);
  const deploymentInfo = getDeploymentInfo();

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'released':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <GitBranch className="w-6 h-6" />
          Release Notes
        </h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          v{deploymentInfo.currentVersion}
        </Badge>
      </div>

      {/* Deployment Status */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Current Version</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {deploymentInfo.currentVersion}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Environment</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {deploymentInfo.environment}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Uptime</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {deploymentInfo.uptime}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Release */}
      {releases.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100 flex items-center justify-between">
              <span>Latest Release</span>
              <Badge className={getStatusBadgeColor(releases[0].status)}>
                {releases[0].status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">{releases[0].name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {releases[0].date}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Highlights:</p>
              <ul className="space-y-1 ml-4">
                {releases[0].highlights.map((highlight, idx) => (
                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 list-disc">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Release History */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Release History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {releases.map((release) => (
            <div
              key={release.id}
              className="border dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedRelease(expandedRelease === release.id ? null : release.id)
                }
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {release.version}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {release.name}
                  </span>
                  <Badge className={getStatusBadgeColor(release.status)}>
                    {release.status}
                  </Badge>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedRelease === release.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedRelease === release.id && (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    Released: {release.date}
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Highlights:</p>
                    <ul className="space-y-1 ml-4">
                      {release.highlights.map((highlight, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-slate-600 dark:text-slate-400 list-disc"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Download Release Notes */}
      <div className="flex gap-2">
        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
          <Download className="w-4 h-4 mr-2" />
          Download Release Notes (PDF)
        </Button>
      </div>
    </div>
  );
}