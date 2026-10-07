import React, { useEffect, useState, useMemo } from 'react';
import { Activity, Edit2, MessageSquare, CheckCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Activity Feed - Feed de atividades em tempo real
 * Edições, comentários, resoluções
 */
export default function ActivityFeed({ documentId, maxItems = 10 }) {
  const [activities, setActivities] = useState([
    { id: 1, user: 'João', action: 'edit', text: 'Editou o parágrafo 1', timestamp: new Date(Date.now() - 60000) },
    { id: 2, user: 'Maria', action: 'comment', text: 'Adicionou um comentário', timestamp: new Date(Date.now() - 120000) },
    { id: 3, user: 'João', action: 'resolve', text: 'Resolveu o comentário', timestamp: new Date(Date.now() - 300000) },
    { id: 4, user: 'Sistema', action: 'save', text: 'Documento salvo automaticamente', timestamp: new Date(Date.now() - 600000) },
  ]);

  const getActionIcon = (action) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (action) {
      case 'edit': return <Edit2 {...iconProps} className="w-4 h-4 text-blue-500" />;
      case 'comment': return <MessageSquare {...iconProps} className="w-4 h-4 text-purple-500" />;
      case 'resolve': return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />;
      case 'save': return <Activity {...iconProps} className="w-4 h-4 text-gray-500" />;
      default: return <User {...iconProps} className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'edit': return 'bg-blue-50 border-blue-200';
      case 'comment': return 'bg-purple-50 border-purple-200';
      case 'resolve': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    return `${Math.floor(seconds / 3600)}h atrás`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Feed de Atividades</h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.slice(0, maxItems).map(activity => (
          <Card
            key={activity.id}
            className={`p-3 border ${getActionColor(activity.action)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getActionIcon(activity.action)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-600"> {activity.text}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.timestamp)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <Card className="p-4 text-center text-gray-500 text-sm">
          Nenhuma atividade ainda
        </Card>
      )}
    </div>
  );
}