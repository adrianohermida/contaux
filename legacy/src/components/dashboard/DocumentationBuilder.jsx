/**
 * DocumentationBuilder Component
 * Auto-generated API documentation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Code, Lock } from 'lucide-react';

export default function DocumentationBuilder() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const endpoints = [
    {
      path: '/api/v3/users',
      method: 'GET',
      description: 'Retrieve list of users',
      auth: 'OAuth 2.0',
      params: [
        { name: 'limit', type: 'integer', description: 'Results per page' },
        { name: 'offset', type: 'integer', description: 'Pagination offset' },
      ],
      response: { code: 200, example: '{ "users": [], "total": 100 }' },
    },
    {
      path: '/api/v3/products',
      method: 'GET',
      description: 'Get product catalog',
      auth: 'API Key',
      params: [{ name: 'category', type: 'string', description: 'Filter by category' }],
      response: { code: 200, example: '{ "products": [] }' },
    },
    {
      path: '/api/v3/orders',
      method: 'POST',
      description: 'Create new order',
      auth: 'OAuth 2.0',
      params: [{ name: 'items', type: 'array', description: 'Order items' }],
      response: { code: 201, example: '{ "order_id": "...", "status": "pending" }' },
    },
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'POST':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">API Documentation</h2>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <BookOpen className="w-4 h-4" />
          View Full Docs
        </Button>
      </div>

      {/* Endpoints List */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Code className="w-4 h-4" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {endpoints.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEndpoint(selectedEndpoint?.path === ep.path ? null : ep)}
              className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Badge className={getMethodColor(ep.method)}>{ep.method}</Badge>
                  <code className="text-sm font-mono text-slate-800 dark:text-slate-100">
                    {ep.path}
                  </code>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{ep.description}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Endpoint Details */}
      {selectedEndpoint && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">
              <div className="flex items-center gap-2">
                <Badge className={getMethodColor(selectedEndpoint.method)}>
                  {selectedEndpoint.method}
                </Badge>
                <code className="font-mono">{selectedEndpoint.path}</code>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Description</p>
              <p className="text-slate-900 dark:text-slate-100">{selectedEndpoint.description}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Authentication
              </p>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 mt-1">
                {selectedEndpoint.auth}
              </Badge>
            </div>

            {selectedEndpoint.params.length > 0 && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Parameters</p>
                <div className="space-y-2">
                  {selectedEndpoint.params.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm"
                    >
                      <p className="font-mono text-slate-800 dark:text-slate-100">
                        {p.name}
                        <Badge className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {p.type}
                        </Badge>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Response Example</p>
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono text-slate-800 dark:text-slate-100 overflow-x-auto">
                {selectedEndpoint.response.example}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authentication Guide */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Lock className="w-4 h-4" />
            Authentication Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">OAuth 2.0</p>
            <p className="text-slate-600 dark:text-slate-400">
              Use for user-specific operations. Get token from /auth/authorize.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">API Key</p>
            <p className="text-slate-600 dark:text-slate-400">
              Use for server-to-server communication. Include X-API-Key header.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}