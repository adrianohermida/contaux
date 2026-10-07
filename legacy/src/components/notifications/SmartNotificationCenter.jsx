/**
 * SmartNotificationCenter Component
 * Centralized notification management and display
 */

import React, { useState } from 'react';
import { useSmartNotifications } from '../hooks/useSmartNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Check, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const NOTIFICATION_COLORS = {
  info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
};

export default function SmartNotificationCenter({ workspaceId }) {
  const {
    notifications,
    sendSmartNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    getUnreadCount,
    getNotificationStats,
  } = useSmartNotifications(workspaceId);

  const [filter, setFilter] = useState('all');
  const stats = getNotificationStats();
  const unreadCount = getUnreadCount();

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold dark:text-slate-100">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-3xl font-bold dark:text-slate-100">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unread</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.unread}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Read</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.read}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">High Priority</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.byPriority.high + stats.byPriority.urgent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="dark:bg-slate-800">
          <TabsTrigger value="all" className="dark:data-[state=active]:bg-slate-700">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="unread" className="dark:data-[state=active]:bg-slate-700">
            Unread ({stats.unread})
          </TabsTrigger>
          <TabsTrigger value="info" className="dark:data-[state=active]:bg-slate-700">
            Info ({stats.byType.info})
          </TabsTrigger>
          <TabsTrigger value="success" className="dark:data-[state=active]:bg-slate-700">
            Success ({stats.byType.success})
          </TabsTrigger>
          <TabsTrigger value="warning" className="dark:data-[state=active]:bg-slate-700">
            Warning ({stats.byType.warning})
          </TabsTrigger>
          <TabsTrigger value="error" className="dark:data-[state=active]:bg-slate-700">
            Error ({stats.byType.error})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3 mt-4">
          {filteredNotifications.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-12 pb-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Info;
              const colorClass = NOTIFICATION_COLORS[notification.type];

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${
                    notification.status === 'unread'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-white dark:bg-slate-800'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium dark:text-slate-100">{notification.title}</h3>
                          <Badge
                            className={`${colorClass} text-xs`}
                          >
                            {notification.type}
                          </Badge>
                          {notification.priority !== 'normal' && (
                            <Badge
                              className={`${
                                notification.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              }`}
                            >
                              {notification.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {notification.status === 'unread' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="dark:hover:bg-slate-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-500 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {notification.action_label && notification.action_url && (
                    <div className="mt-3 ml-12">
                      <Button
                        size="sm"
                        variant="outline"
                        className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {notification.action_label}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}