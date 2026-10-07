/**
 * Activity Timeline Item
 * Individual activity entry in timeline
 */

import React from 'react';
import {
  FileText,
  Tag,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Clock,
  User,
  Link as LinkIcon,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACTIVITY_CONFIG = {
  note: {
    icon: MessageSquare,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    label: 'Nota',
  },
  edit: {
    icon: Edit,
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    label: 'Editado',
  },
  tag_added: {
    icon: Tag,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    label: 'Tag Adicionada',
  },
  tag_removed: {
    icon: Tag,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    label: 'Tag Removida',
  },
  status_change: {
    icon: CheckCircle,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    label: 'Status Alterado',
  },
  created: {
    icon: Plus,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    label: 'Criado',
  },
  relationship: {
    icon: LinkIcon,
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    label: 'Relacionamento',
  },
};

export default function ActivityTimelineItem({ activity, isFirst = false, isLast = false }) {
  const config = ACTIVITY_CONFIG[activity.activity_type] || ACTIVITY_CONFIG.edit;
  const Icon = config.icon;

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const renderDescription = () => {
    const { activity_type, description, metadata = {} } = activity;

    switch (activity_type) {
      case 'tag_added':
        return `Tag "${metadata.tag_name}" adicionada`;
      case 'tag_removed':
        return `Tag "${metadata.tag_name}" removida`;
      case 'status_change':
        return `Status alterado de "${metadata.old_status}" para "${metadata.new_status}"`;
      case 'edit':
        return `Contato atualizado: ${description || metadata.fields?.join(', ') || 'informações gerais'}`;
      case 'note':
        return description;
      case 'relationship':
        return `Relacionamento ${metadata.is_new ? 'criado' : 'removido'}: ${metadata.relationship_type}`;
      default:
        return description;
    }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      {!isLast && (
        <div
          className="absolute left-6 top-12 w-0.5 h-12 bg-slate-200 dark:bg-slate-700"
          aria-hidden="true"
        />
      )}

      {/* Timeline Dot */}
      <div className="relative flex gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${config.color} border-4 border-white dark:border-slate-950 shadow-md`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          {/* Header */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {config.label}
            </h4>
            <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
              {formatDate(activity.created_date)}
            </time>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {renderDescription()}
          </p>

          {/* Metadata */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
              {activity.metadata.fields && activity.metadata.fields.length > 0 && (
                <p>
                  <strong>Campos:</strong> {activity.metadata.fields.join(', ')}
                </p>
              )}
              {activity.metadata.old_value && (
                <p>
                  <strong>Anterior:</strong> {activity.metadata.old_value}
                </p>
              )}
              {activity.metadata.new_value && (
                <p>
                  <strong>Novo:</strong> {activity.metadata.new_value}
                </p>
              )}
            </div>
          )}

          {/* User */}
          {activity.created_by && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <User className="w-3 h-3" aria-hidden="true" />
              por <span className="font-medium">{activity.created_by}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}