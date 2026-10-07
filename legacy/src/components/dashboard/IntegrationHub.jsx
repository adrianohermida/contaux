/**
 * IntegrationHub Component
 * Central hub for managing integrations and connectors
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Plug, RefreshCw } from 'lucide-react';

export default function IntegrationHub() {
  const [services] = useState([
    {
      name: 'Stripe',
      status: 'connected',
      lastSync: '5 min ago',
      records: 2456,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900',
    },
    {
      name: 'Slack',
      status: 'connected',
      lastSync: '2 min ago',
      records: 1234,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900',
    },
    {
      name: 'GitHub',
      status: 'connected',
      lastSync: '15 min ago',
      records: 567,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900',
    },
    {
      name: 'Google Sheets',
      status: 'connected',
      lastSync: '10 min ago',
      records: 892,
      color: 'bg-green-100 text-green-800 dark:bg-green-900',
    },
  ]);

  const getStatusColor = (status) => {
    return status === 'connected'
      ? 'bg-green-100 text-green-800 dark:bg-green-900'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Integration Hub</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {services.filter((s) => s.status === 'connected').length}/{services.length} Connected
        </Badge>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service, idx) => (
          <Card key={idx} className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">{service.name}</h3>
                <Badge className={getStatusColor(service.status)}>
                  {service.status.toUpperCase()}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Last sync: {service.lastSync}
              </p>

              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {service.records} records synced
              </p>

              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync Now
                </Button>
                <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white text-xs flex-1">
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Integration */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Plug className="w-4 h-4" />
            Add New Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse Integrations</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Custom API</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">OAuth Provider</Button>
        </CardContent>
      </Card>
    </div>
  );
}