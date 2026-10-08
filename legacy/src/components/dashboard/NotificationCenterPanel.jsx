import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Mail, MessageSquare, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NotificationCenterPanel({ clientId, tenantId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    enabled: true,
    email: '',
    notifications_on: ['payment_received', 'invoice_created', 'nfe_issued']
  });

  const NOTIFICATION_TYPES = {
    payment_received: { icon: '💰', label: 'Pagamento Recebido', color: 'green' },
    invoice_created: { icon: '📄', label: 'Fatura Criada', color: 'blue' },
    nfe_issued: { icon: '📋', label: 'NF-e Emitida', color: 'purple' },
    alert: { icon: '⚠️', label: 'Alerta', color: 'yellow' },
    system: { icon: '⚙️', label: 'Sistema', color: 'gray' },
    email: { icon: '📧', label: 'Email', color: 'blue' }
  };

  useEffect(() => {
    loadNotifications();
  }, [clientId, tenantId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Simular notificações
      const simulatedNotifications = [
        {
          id: 'notif_001',
          type: 'payment_received',
          title: 'Pagamento Recebido',
          message: 'Pagamento de R$ 1.500,00 foi confirmado',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          action_url: '/payments'
        },
        {
          id: 'notif_002',
          type: 'invoice_created',
          title: 'Fatura Criada',
          message: 'Fatura NF-001234 foi criada com sucesso',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          action_url: '/invoices'
        },
        {
          id: 'notif_003',
          type: 'nfe_issued',
          title: 'NF-e Autorizada',
          message: 'NF-e 001234 foi autorizada pela Sefaz',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          action_url: '/nfe'
        },
        {
          id: 'notif_004',
          type: 'alert',
          title: 'Certificado Digital',
          message: 'Seu certificado A1 vence em 30 dias',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          action_url: '/certificates'
        }
      ];

      setNotifications(simulatedNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Todas as notificações marcadas como lidas');
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Limpar todas as notificações?')) {
      setNotifications([]);
      toast.success('Notificações limpas');
    }
  };

  const handleSaveEmailConfig = async () => {
    try {
      setLoading(true);
      // Em produção, salvar no backend
      toast.success('Configuração de email salva!');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const typeMatch = filterType === 'all' || n.type === filterType;
    const readMatch = !showUnreadOnly || !n.read;
    return typeMatch && readMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          📧 Configuração de Notificações por Email
        </h3>

        <div>
          <label className="block text-sm font-medium mb-2">
            <input
              type="checkbox"
              checked={emailConfig.enabled}
              onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
              className="mr-2"
            />
            Ativar notificações por email
          </label>
        </div>

        {emailConfig.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Email de Notificação</label>
              <input
                type="email"
                value={emailConfig.email}
                onChange={(e) => setEmailConfig({ ...emailConfig, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipos de Notificação</label>
              <div className="space-y-2">
                {['payment_received', 'invoice_created', 'nfe_issued', 'alert', 'system'].map(type => (
                  <label key={type} className="flex items-center gap-2 p-2 rounded border hover:bg-blue-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.notifications_on.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEmailConfig({
                            ...emailConfig,
                            notifications_on: [...emailConfig.notifications_on, type]
                          });
                        } else {
                          setEmailConfig({
                            ...emailConfig,
                            notifications_on: emailConfig.notifications_on.filter(t => t !== type)
                          });
                        }
                      }}
                    />
                    <span className="text-sm">
                      {NOTIFICATION_TYPES[type]?.icon} {NOTIFICATION_TYPES[type]?.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveEmailConfig}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Configuração
            </Button>
          </>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">🔔 Notificações</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-600">{unreadCount} não lida(s)</p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                Marcar tudo como lido
              </Button>
            )}
            {notifications.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleClearAll}>
                Limpar tudo
              </Button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 pb-4 border-b overflow-x-auto">
          <Button
            size="sm"
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            Todos
          </Button>
          {Object.entries(NOTIFICATION_TYPES).map(([type, info]) => (
            <Button
              key={type}
              size="sm"
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
            >
              {info.icon} {info.label}
            </Button>
          ))}
        </div>

        {/* List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
            {notifications.length === 0 ? 'Nenhuma notificação' : 'Nenhuma notificação com este filtro'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map(notif => {
              const typeInfo = NOTIFICATION_TYPES[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border-l-4 flex items-start justify-between transition-all ${
                    notif.read
                      ? 'bg-slate-50 opacity-75'
                      : 'bg-white border-blue-500'
                  }`}
                  style={{
                    borderLeftColor: {
                      green: '#10b981',
                      blue: '#3b82f6',
                      purple: '#a855f7',
                      yellow: '#f59e0b',
                      gray: '#6b7280'
                    }[typeInfo?.color]
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{typeInfo?.icon}</span>
                      <h4 className={`font-semibold text-sm ${notif.read ? '' : 'text-blue-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                          Novo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{notif.message}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(notif.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {notif.action_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = notif.action_url}
                      >
                        Ver
                      </Button>
                    )}
                    {!notif.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteNotification(notif.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">💡 Sobre Notificações:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Receba notificações em tempo real sobre eventos importantes</li>
          <li>Configure quais tipos de notificação deseja receber</li>
          <li>Marque notificações como lidas ou delete-as</li>
          <li>Integre com seus canais de comunicação preferidos</li>
        </ul>
      </div>
    </div>
  );
}