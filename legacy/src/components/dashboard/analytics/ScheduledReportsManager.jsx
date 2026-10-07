import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Plus, Trash2, Edit2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ScheduledReportsManager({ workspaceId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    report_name: '',
    frequency: 'weekly',
    email_recipients: '',
    format: 'pdf',
    include_sections: ['summary', 'charts']
  });

  // Fetch scheduled reports
  const { data: scheduledReports = [], refetch } = useQuery({
    queryKey: ['scheduled-reports', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.Report.filter({ tenant_id: workspaceId, is_scheduled: true });
    },
    enabled: !!workspaceId
  });

  // Create scheduled report
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Report.create({
        tenant_id: workspaceId,
        report_name: data.report_name,
        report_type: 'scheduled',
        is_scheduled: true,
        schedule_frequency: data.frequency,
        schedule_time: '08:00',
        email_recipients: data.email_recipients.split(',').map(e => e.trim()),
        export_format: data.format,
        include_sections: data.include_sections,
        status: 'active'
      });
    },
    onSuccess: () => {
      toast.success('Relatório agendado com sucesso');
      setShowForm(false);
      setFormData({
        report_name: '',
        frequency: 'weekly',
        email_recipients: '',
        format: 'pdf',
        include_sections: ['summary', 'charts']
      });
      refetch();
    },
    onError: (err) => {
      toast.error('Erro ao agendar relatório');
      console.error(err);
    }
  });

  // Delete scheduled report
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Report.delete(id);
    },
    onSuccess: () => {
      toast.success('Relatório removido');
      refetch();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.report_name || !formData.email_recipients) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    createMutation.mutate(formData);
  };

  const frequencyLabels = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    quarterly: 'Trimestralmente'
  };

  const formatLabels = {
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV',
    json: 'JSON'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Relatórios Agendados
          </h3>
          <p className="text-sm text-slate-600 mt-1">Configure envios automáticos de relatórios</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Relatório</label>
                <input
                  type="text"
                  value={formData.report_name}
                  onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
                  placeholder="Ex: Relatório Mensal de Receitas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frequência</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Formato</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formatLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destinatários (emails)</label>
                <input
                  type="text"
                  value={formData.email_recipients}
                  onChange={(e) => setFormData({ ...formData, email_recipients: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                {createMutation.isPending ? 'Agendando...' : 'Agendar Relatório'}
              </Button>
              <Button type="button" onClick={() => setShowForm(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {scheduledReports.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Nenhum relatório agendado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Frequência</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Formato</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scheduledReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{report.report_name}</td>
                  <td className="px-6 py-4 text-sm">{frequencyLabels[report.schedule_frequency] || report.schedule_frequency}</td>
                  <td className="px-6 py-4 text-sm">{formatLabels[report.export_format] || report.export_format}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {report.status === 'active' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Ativo</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-600">Inativo</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(report.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}