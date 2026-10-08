import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function CircularGauge({ value, size = 120 }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (value / 100) * circumference;
  
  let color = '#ef4444'; // red
  if (value >= 60 && value < 80) color = '#f59e0b'; // amber
  if (value >= 80) color = '#10b981'; // emerald
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            className="dark:stroke-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">pontos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QualityMetric({ label, percentage, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color === 'green' ? 'bg-green-500' :
            color === 'amber' ? 'bg-amber-500' :
            'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function DataQualityWidget({ workspaceId }) {
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts-quality', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['contact-notes-quality', workspaceId],
    queryFn: () => base44.entities.ContactNote.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && contacts.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['contact-tags-quality', workspaceId],
    queryFn: () => base44.entities.ContactTagAssignment.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && contacts.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const { data: attachments = [], isLoading: attachmentsLoading } = useQuery({
    queryKey: ['contact-attachments-quality', workspaceId],
    queryFn: () => base44.entities.ContactAttachment.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && contacts.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const { data: customFieldValues = [] } = useQuery({
    queryKey: ['custom-field-values-quality', workspaceId],
    queryFn: () => base44.entities.CustomFieldValue.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && contacts.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = contactsLoading || notesLoading || tagsLoading || attachmentsLoading;

  if (isLoading || contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Qualidade dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics
  const totalContacts = contacts.length;
  const withNotes = new Set(notes.map(n => n.contact_id)).size;
  const withTags = new Set(tags.map(t => t.contact_id)).size;
  const withAttachments = new Set(attachments.map(a => a.contact_id)).size;
  const withCustomFields = new Set(customFieldValues.map(v => v.entity_id)).size;

  // Calculate percentages
  const withNotesPercent = totalContacts > 0 ? Math.round((withNotes / totalContacts) * 100) : 0;
  const withTagsPercent = totalContacts > 0 ? Math.round((withTags / totalContacts) * 100) : 0;
  const withAttachmentsPercent = totalContacts > 0 ? Math.round((withAttachments / totalContacts) * 100) : 0;
  const withCustomFieldsPercent = totalContacts > 0 ? Math.round((withCustomFields / totalContacts) * 100) : 0;

  // Completeness - contacts with filled basic fields
  const completeContacts = contacts.filter(c => 
    c.company_name && 
    c.email && 
    (c.client_type === 'pj' ? c.cnpj : c.cpf)
  ).length;
  const completenessPercent = Math.round((completeContacts / totalContacts) * 100);

  // Overall score (weighted average)
  const weights = {
    completeness: 0.25,
    notes: 0.15,
    tags: 0.15,
    attachments: 0.15,
    customFields: 0.30,
  };

  const overallScore = Math.round(
    (completenessPercent * weights.completeness) +
    (withNotesPercent * weights.notes) +
    (withTagsPercent * weights.tags) +
    (withAttachmentsPercent * weights.attachments) +
    (withCustomFieldsPercent * weights.customFields)
  );

  // Determine badge
  let badge = '';
  if (overallScore < 60) badge = '🥉 Bronze';
  else if (overallScore < 80) badge = '🥈 Prata';
  else badge = '🥇 Ouro';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Qualidade dos Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex flex-col items-center gap-2">
          <CircularGauge value={overallScore} />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {badge}
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pt-2 border-t">
          <QualityMetric 
            label="Campos Básicos Preenchidos" 
            percentage={completenessPercent}
            color={completenessPercent >= 80 ? 'green' : completenessPercent >= 60 ? 'amber' : 'red'}
          />
          <QualityMetric 
            label="Contatos com Notas" 
            percentage={withNotesPercent}
            color={withNotesPercent >= 50 ? 'green' : withNotesPercent >= 20 ? 'amber' : 'red'}
          />
          <QualityMetric 
            label="Contatos com Tags" 
            percentage={withTagsPercent}
            color={withTagsPercent >= 60 ? 'green' : withTagsPercent >= 30 ? 'amber' : 'red'}
          />
          <QualityMetric 
            label="Contatos com Anexos" 
            percentage={withAttachmentsPercent}
            color={withAttachmentsPercent >= 40 ? 'green' : withAttachmentsPercent >= 20 ? 'amber' : 'red'}
          />
          <QualityMetric 
            label="Contatos com Campos Custom" 
            percentage={withCustomFieldsPercent}
            color={withCustomFieldsPercent >= 50 ? 'green' : withCustomFieldsPercent >= 20 ? 'amber' : 'red'}
          />
        </div>

        {/* Insights */}
        <div className="pt-2 border-t">
          {overallScore < 60 && (
            <div className="flex gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Melhorar completude de dados para maior qualidade</span>
            </div>
          )}
          {overallScore >= 60 && overallScore < 80 && (
            <div className="flex gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Bom progresso! Adicione mais notas e tags</span>
            </div>
          )}
          {overallScore >= 80 && (
            <div className="flex gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Excelente qualidade de dados!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}