import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function BlogScheduler({ blogPostId, currentStatus, onSchedule }) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedulePost = async () => {
    if (!scheduledDate) {
      alert('Selecione uma data');
      return;
    }

    setIsScheduling(true);
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      
      await base44.entities.BlogPost.update(blogPostId, {
        status: 'scheduled',
        scheduled_date: scheduledDateTime
      });

      setShowScheduler(false);
      setScheduledDate('');
      setScheduledTime('09:00');
      
      if (onSchedule) onSchedule();
      alert('Post agendado com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar post:', error);
      alert('Erro ao agendar post');
    } finally {
      setIsScheduling(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agendar Publicação</h3>
      </div>

      {currentStatus === 'scheduled' && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Post agendado</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Será publicado automaticamente na data e hora agendadas</p>
          </div>
        </div>
      )}

      {!showScheduler ? (
        <Button 
          onClick={() => setShowScheduler(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Agendar Publicação
        </Button>
      ) : (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Data de Publicação
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSchedulePost}
              disabled={isScheduling || !scheduledDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScheduling ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
            <Button
              onClick={() => setShowScheduler(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}