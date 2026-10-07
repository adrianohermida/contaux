/**
 * ComplianceReporter Component
 * Generate and display compliance reports (GDPR, LGPD, CCPA)
 */

import React, { useState } from 'react';
import { useComplianceReport } from '../hooks/useComplianceReport';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Calendar,
} from 'lucide-react';

export default function ComplianceReporter({ workspaceId }) {
  const { generateGDPRReport, generateLGPDReport, generateCCPAReport, getComplianceSummary } =
    useComplianceReport(workspaceId);
  const [activeReport, setActiveReport] = useState('gdpr');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (type) => {
    setLoading(true);
    try {
      let generatedReport;
      switch (type) {
        case 'gdpr':
          generatedReport = await generateGDPRReport();
          break;
        case 'lgpd':
          generatedReport = await generateLGPDReport();
          break;
        case 'ccpa':
          generatedReport = await generateCCPAReport();
          break;
        default:
          generatedReport = await getComplianceSummary();
      }
      setReport(generatedReport);
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;

    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.type}-compliance-report-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 dark:text-slate-400" />
        <h2 className="text-2xl font-bold dark:text-slate-100">Compliance Reports</h2>
      </div>

      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full md:grid-cols-4 dark:bg-slate-800 dark:border-slate-700">
          <TabsTrigger value="gdpr" className="dark:data-[state=active]:bg-slate-700">
            GDPR
          </TabsTrigger>
          <TabsTrigger value="lgpd" className="dark:data-[state=active]:bg-slate-700">
            LGPD
          </TabsTrigger>
          <TabsTrigger value="ccpa" className="dark:data-[state=active]:bg-slate-700">
            CCPA
          </TabsTrigger>
          <TabsTrigger value="summary" className="dark:data-[state=active]:bg-slate-700">
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gdpr" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">
                GDPR Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                General Data Protection Regulation (EU) - Comprehensive compliance check
              </p>
              <Button
                onClick={() => handleGenerateReport('gdpr')}
                disabled={loading}
                className="dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {loading ? 'Generating...' : 'Generate GDPR Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lgpd" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">
                LGPD Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Lei Geral de Proteção de Dados (Brazil) - Brazilian data protection compliance
              </p>
              <Button
                onClick={() => handleGenerateReport('lgpd')}
                disabled={loading}
                className="dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {loading ? 'Generating...' : 'Generate LGPD Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ccpa" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">
                CCPA Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                California Consumer Privacy Act - California resident data protection
              </p>
              <Button
                onClick={() => handleGenerateReport('ccpa')}
                disabled={loading}
                className="dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {loading ? 'Generating...' : 'Generate CCPA Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">
                Complete Compliance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Generate complete compliance report across all standards (GDPR, LGPD, CCPA)
              </p>
              <Button
                onClick={() => handleGenerateReport('summary')}
                disabled={loading}
                className="dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {loading ? 'Generating...' : 'Generate Complete Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Display */}
      {report && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="dark:text-slate-100">
                  {report.type} Report
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(report.generatedDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {report.summary?.compliancePercentage || report.overallCompliancePercentage}% Compliant
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sections */}
            {(report.sections || {}) && Object.entries(report.sections).map(([key, section]) => (
              <div key={key} className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold dark:text-slate-200">{section.title}</h3>
                <div className="space-y-2">
                  {section.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm dark:text-slate-300"
                    >
                      {check.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      )}
                      <span>{check.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary */}
            {(report.summary || report.overallStatus) && (
              <div className="space-y-3">
                <h3 className="font-semibold dark:text-slate-200">Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-3 dark:bg-slate-700 dark:border-slate-600">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Checks</p>
                    <p className="text-2xl font-bold dark:text-slate-200">
                      {report.summary?.totalChecks || report.standards?.length || 0}
                    </p>
                  </Card>
                  <Card className="p-3 dark:bg-slate-700 dark:border-slate-600">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Passed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {report.summary?.passedChecks || report.standards?.length || 0}
                    </p>
                  </Card>
                  <Card className="p-3 dark:bg-slate-700 dark:border-slate-600">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Risk Level</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {report.summary?.riskLevel || report.overallStatus || 'Low'}
                    </Badge>
                  </Card>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.summary?.recommendations && (
              <div className="space-y-3">
                <h3 className="font-semibold dark:text-slate-200">Recommendations</h3>
                <ul className="space-y-2">
                  {report.summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Export Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={handleExportPDF}
                className="gap-2 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}