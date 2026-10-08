/**
 * ComplianceReporter Component
 * Compliance reporting and certification management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, Download, CheckCircle } from 'lucide-react';

export default function ComplianceReporter() {
  const [certifications] = useState([
    {
      id: 'cert_001',
      name: 'ISO 27001',
      status: 'certified',
      issueDate: '2024-03-02',
      expiryDate: '2027-03-02',
    },
    {
      id: 'cert_002',
      name: 'SOC 2 Type II',
      status: 'certified',
      issueDate: '2023-06-15',
      expiryDate: '2027-06-15',
    },
    {
      id: 'cert_003',
      name: 'GDPR Compliant',
      status: 'compliant',
      issueDate: '2023-01-01',
      expiryDate: null,
    },
  ]);

  const [reports] = useState([
    {
      id: 'rpt_001',
      type: 'Annual Audit',
      date: '2026-03-01',
      status: 'completed',
      score: 95,
    },
    {
      id: 'rpt_002',
      type: 'Quarterly Review',
      date: '2025-12-15',
      status: 'completed',
      score: 93,
    },
    {
      id: 'rpt_003',
      type: 'Monthly Check',
      date: '2025-02-28',
      status: 'completed',
      score: 94,
    },
  ]);

  const getStatusColor = (status) => {
    return status === 'certified' || status === 'compliant'
      ? 'bg-green-100 text-green-800 dark:bg-green-900'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Compliance Reports</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Certifications */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <FileCheck className="w-4 h-4" />
            Active Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-start"
            >
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">{cert.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Valid until {new Date(cert.expiryDate || cert.issueDate).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(cert.status)}>
                {cert.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reports */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <CheckCircle className="w-4 h-4" />
            Audit Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {report.type}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(report.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">{report.score}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {report.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}