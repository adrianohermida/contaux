import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NotificationsPanel from './NotificationsPanel';

export default function NotificationBell({ tenantId, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;

    const loadUnreadCount = async () => {
      try {
        const notifications = await base44.entities.Notification.filter({
          tenant_id: tenantId,
          user_email: user.email,
          is_read: false
        });
        setUnreadCount(notifications.length || 0);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [tenantId, user?.email]);

  // Fecha panel ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute right-0 top-full mt-2 z-50">
          <NotificationsPanel tenantId={tenantId} user={user} />
        </div>
      )}
    </div>
  );
}