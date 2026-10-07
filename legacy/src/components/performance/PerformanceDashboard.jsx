/**
 * Performance Dashboard
 * Combines Web Vitals and Bundle Analysis
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebVitalsDisplay from './WebVitalsDisplay';
import BundleAnalysisDisplay from './BundleAnalysisDisplay';
import { Activity, Package } from 'lucide-react';

export default function PerformanceDashboard() {
  const [activeTab, setActiveTab] = useState('vitals');

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Performance Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Real-time monitoring of web vitals and bundle size metrics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Web Vitals
          </TabsTrigger>
          <TabsTrigger value="bundle" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Bundle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="mt-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <WebVitalsDisplay />
          </div>
        </TabsContent>

        <TabsContent value="bundle" className="mt-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <BundleAnalysisDisplay />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}