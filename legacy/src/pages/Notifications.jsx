import React from 'react';
import { Bell } from 'lucide-react';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import SubscriptionManager from '@/components/notifications/SubscriptionManager';

export default function Notifications() {
  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Notificações
        </h1>
        <p className="text-gray-600">
          Gerencie suas notificações push e preferências
        </p>
      </div>

      <PushNotificationManager />

      <SubscriptionManager />

      <div>
        <h2 className="text-xl font-semibold mb-4">Centro de Notificações</h2>
        <NotificationCenter />
      </div>
    </div>
  );
}