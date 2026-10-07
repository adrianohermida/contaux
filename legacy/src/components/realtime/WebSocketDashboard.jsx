/**
 * WebSocketDashboard Component
 * Real-time WebSocket monitoring and management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Send, Zap, AlertCircle } from 'lucide-react';

export default function WebSocketDashboard() {
  const [wsStatus, setWsStatus] = useState({
    isConnected: true,
    lastConnected: new Date(),
    reconnectAttempts: 0,
  });

  const [stats, setStats] = useState({
    sent: 245,
    received: 892,
    errors: 3,
    latency: 45,
  });

  const [messages, setMessages] = useState([
    { id: 1, type: 'sync', direction: 'received', timestamp: Date.now() - 2000 },
    { id: 2, type: 'broadcast', direction: 'sent', timestamp: Date.now() - 5000 },
    { id: 3, type: 'presence', direction: 'received', timestamp: Date.now() - 8000 },
    { id: 4, type: 'data', direction: 'sent', timestamp: Date.now() - 12000 },
    { id: 5, type: 'error', direction: 'received', timestamp: Date.now() - 15000 },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);

  const messageTypes = {
    sync: 'Synchronization',
    broadcast: 'Broadcast',
    presence: 'Presence Update',
    data: 'Data Update',
    error: 'Error',
  };

  const directionColors = {
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">WebSocket Dashboard</h2>
        <Badge
          className={`${
            wsStatus.isConnected
              ? 'bg-green-100 text-green-800 dark:bg-green-900'
              : 'bg-red-100 text-red-800 dark:bg-red-900'
          }`}
        >
          {wsStatus.isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Activity className="w-4 h-4" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
            <Badge
              className={`${
                wsStatus.isConnected
                  ? 'bg-green-100 text-green-800 dark:bg-green-900'
                  : 'bg-red-100 text-red-800 dark:bg-red-900'
              }`}
            >
              {wsStatus.isConnected ? 'Connected' : 'Reconnecting...'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Last Connected
            </span>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {new Date(wsStatus.lastConnected).toLocaleTimeString()}
            </span>
          </div>

          {wsStatus.reconnectAttempts > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Reconnect Attempts
              </span>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900">
                {wsStatus.reconnectAttempts}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Messages Sent</p>
              <p className="text-3xl font-bold dark:text-slate-100">{stats.sent}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Messages Received</p>
              <p className="text-3xl font-bold dark:text-slate-100">{stats.received}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Latency</p>
              <p className="text-3xl font-bold dark:text-slate-100">{stats.latency}ms</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Errors</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.errors}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Stream */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Zap className="w-4 h-4" />
            Message Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {msg.direction === 'sent' ? (
                      <Send className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-green-500" />
                    )}
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {messageTypes[msg.type]}
                    </span>
                  </div>
                  <Badge className={directionColors[msg.direction]}>
                    {msg.direction === 'sent' ? 'Sent' : 'Received'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Monitoring */}
      {stats.errors > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4" />
              Recent Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'Connection timeout (retry 2)',
              'Message parsing error',
              'Reconnection failed',
            ].map((error, idx) => (
              <div key={idx} className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Connection Stability
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                99.2%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: '99.2%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Message Throughput
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                1,137 msg/s
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: '85%' }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}