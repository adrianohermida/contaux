import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPanel({ tenantId, user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    
    const loadNotifications = async () => {
      try {
        const data = await base44.entities.Notification.filter({
          tenant_id: tenantId,
          user_email: user.email
        });
        setNotifications(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        setUnreadCount(data.filter(n => !n.is_read).length);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [tenantId, user?.email]);

  const handleMarkRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleDelete = async (id) => {
    await base44.entities.Notification.delete(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    const icons = {
      success: <CheckCircle className="w-4 h-4 text-green-600" />,
      error: <XCircle className="w-4 h-4 text-red-600" />,
      warning: <AlertCircle className="w-4 h-4 text-yellow-600" />,
      alert: <AlertCircle className="w-4 h-4 text-orange-600" />,
      info: <Info className="w-4 h-4 text-blue-600" />
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Carregando...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhuma notificação</div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`p-4 border-b hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}>
              <div className="flex gap-3">
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900">{notif.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(notif.created_date).toLocaleDateString('pt-BR', { 
                      year: '2-digit', 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!notif.is_read && (
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleMarkRead(notif.id)}>
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(notif.id)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 text-center border-t">
          <Button variant="ghost" size="sm" className="text-blue-600">
            Ver todas as notificações
          </Button>
        </div>
      )}
    </div>
  );
}