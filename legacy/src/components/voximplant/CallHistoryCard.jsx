import React from 'react';
import { PhoneCall, Video, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function CallHistoryCard({ call }) {
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    missed: 'bg-red-100 text-red-800',
    rejected: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-blue-50 rounded-lg">
            {call.call_type === 'video' ? (
              <Video className="w-5 h-5 text-blue-600" />
            ) : (
              <PhoneCall className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{call.contact_name}</p>
            <p className="text-sm text-slate-500">
              {format(new Date(call.call_start_time), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>

        <div className="text-right">
          <Badge className={statusColors[call.status]}>
            {call.status === 'completed' ? 'Concluída' :
             call.status === 'missed' ? 'Perdida' :
             call.status === 'rejected' ? 'Rejeitada' : 'Falha'}
          </Badge>
          <p className="text-sm text-slate-600 mt-1 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(call.duration_seconds)}
          </p>
        </div>
      </div>
    </div>
  );
}