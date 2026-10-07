/**
 * SecurityDashboard Component
 * Enterprise security monitoring and compliance
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Lock, Shield } from 'lucide-react';

export default function SecurityDashboard() {
  const [securityMetrics] = useState({
    vulnerabilities: 0,
    encryptionStatus: 'active',
    auditScore: 95,
    threatsDetected: 0,
    lastUpdate: '5 min ago',
  });

  const [requirements] = useState([
    { id: 1, title: 'Data Encryption', status: 'active', icon: Lock },
    { id: 2, title: 'Access Control', status: 'active', icon: Shield },
    { id: 3, title: 'Audit Logging', status: 'active', icon: CheckCircle },
    { id: 4, title: 'Incident Response', status: 'active', icon: AlertCircle },
  ]);

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Security Dashboard</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {securityMetrics.vulnerabilities} Vulnerabilities
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Audit Score</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {securityMetrics.auditScore}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Excellent compliance
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Encryption</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {securityMetrics.encryptionStatus.toUpperCase()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All data encrypted</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Threats Detected</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {securityMetrics.threatsDetected}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Requirements */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Shield className="w-4 h-4" />
            Security Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center"
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">{req.title}</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
                {req.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}