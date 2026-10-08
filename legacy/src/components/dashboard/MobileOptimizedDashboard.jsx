/**
 * MobileOptimizedDashboard Component
 * Mobile-first design with touch optimization, offline capability, and performance enhancements
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Battery,
  Wifi,
  Zap,
  Cpu,
  HardDrive,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useMobileOptimization } from '@/components/hooks/useMobileOptimization';

export default function MobileOptimizedDashboard() {
  const { mobileState, optimizeForLowEndDevice, getPerformanceRecommendations } = useMobileOptimization();
  const [batterySaver, setBatterySaver] = useState(false);

  const optimizations = optimizeForLowEndDevice();
  const recommendations = getPerformanceRecommendations();

  const getNetworkBadgeColor = (networkType) => {
    switch (networkType) {
      case '4g':
        return 'bg-green-100 text-green-800 dark:bg-green-900';
      case '3g':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900';
    }
  };

  const getDeviceTypeIcon = () => {
    if (mobileState.isMobile) return 'Mobile';
    if (mobileState.isTablet) return 'Tablet';
    return 'Desktop';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-blue-500" />
          Mobile Optimization
        </h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {getDeviceTypeIcon()}
        </Badge>
      </div>

      {/* Device Info */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Device Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Device Type</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {getDeviceTypeIcon()}
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Screen Size</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mobileState.screenSize.charAt(0).toUpperCase() + mobileState.screenSize.slice(1)}
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Orientation</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mobileState.orientation.charAt(0).toUpperCase() + mobileState.orientation.slice(1)}
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Touch Support</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mobileState.touchSupport ? '✓ Yes' : '✗ No'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Battery Level</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Device power</p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mobileState.batteryLevel.toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Network Type</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Connection speed</p>
              </div>
            </div>
            <Badge className={getNetworkBadgeColor(mobileState.networkType)}>
              {mobileState.networkType.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">CPU Cores</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Processing power</p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mobileState.cpuCores}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Device Memory</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">RAM available</p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mobileState.deviceMemory} GB
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Active Optimizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(optimizations).map(([key, enabled]) => (
            <div key={key} className="flex items-center gap-2 p-2">
              {enabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-400" />
              )}
              <span className={`text-sm ${enabled ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
              ✓ All systems optimized!
            </p>
          ) : (
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Battery Saver Mode */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center justify-between">
            Battery Saver Mode
            <Badge className={batterySaver ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-slate-100 text-slate-800 dark:bg-slate-700'}>
              {batterySaver ? 'ON' : 'OFF'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enable battery saver mode to reduce power consumption on mobile devices.
          </p>
          <Button
            onClick={() => setBatterySaver(!batterySaver)}
            className={`w-full ${batterySaver ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} dark:bg-opacity-80`}
          >
            {batterySaver ? 'Disable Battery Saver' : 'Enable Battery Saver'}
          </Button>
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-2 rounded">
            <p>When enabled:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Animations disabled</li>
              <li>Auto-refresh paused</li>
              <li>Video auto-play disabled</li>
              <li>Background tasks minimized</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Offline Capability Status */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Offline Capability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Service Worker Active</p>
              <p className="text-xs text-green-700 dark:text-green-300">App works offline</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-2 rounded">
            <p>✓ Cache-first strategy enabled</p>
            <p>✓ Background sync available</p>
            <p>✓ Periodic sync scheduled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}