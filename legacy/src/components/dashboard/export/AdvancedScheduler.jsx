import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Loader2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedScheduler({ workspaceId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    schedule_name: '',
    frequency: 'daily',
    time: '09:00',
    format: 'pdf',
    email_recipients: '',
    enabled: true
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['export-schedules', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.Report.filter({
        tenant_id: workspaceId,
        is_scheduled: true
      }) || [];
    },
    enabled: !!workspaceId
  });

  const createMutation = useMutation({
    mutationFn: async (schedule) => {
      return base44.entities.Report.create({
        tenant_id: workspaceId,
        ...schedule,
        is_scheduled: true,
        status: 'active'
      });
    },
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['export-schedules', workspaceId] });
      setFormData({
        schedule_name: '',
        frequency: 'daily',
        time: '09:00',
        format: 'pdf',
        email_recipients: '',
        enabled: true
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Report.delete(id);
    },
    onSuccess: () => {
      toast.success('Agendamento removido');
      queryClient.invalidateQueries({ queryKey: ['export-schedules', workspaceId] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      return base44.entities.Report.update(id, {
        enabled: !enabled
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-schedules', workspaceId] });
    }
  });

  const handleSubmit = () => {
    if (!formData.schedule_name || !formData.email_recipients) {
      toast.error('Preencha todos os campos');
      return;
    }
    createMutation.mutate({
      report_name: formData.schedule_name,
      frequency: formData.frequency,
      format: formData.format,
      email_recipients: formData.email_recipients.split(',').map(e => e.trim()),
      schedule_time: formData.time
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Novo Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Nome do agendamento"
            value={formData.schedule_name}
            onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Frequência</label>
              <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formato</label>
              <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <input
            type="text"
            placeholder="Email(s) - separados por vírgula"
            value={formData.email_recipients}
            onChange={(e) => setFormData({ ...formData, email_recipients: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Agendar Exportação
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-slate-500 py-6">Nenhum agendamento criado</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{schedule.report_name}</p>
                    <p className="text-xs text-slate-600">
                      {schedule.frequency} às {schedule.schedule_time} • {schedule.format.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMutation.mutate({ id: schedule.id, enabled: schedule.enabled })}
                      className="p-2 hover:bg-slate-200 rounded"
                    >
                      {schedule.enabled ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(schedule.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}