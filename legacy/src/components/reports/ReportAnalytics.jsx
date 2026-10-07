/**
 * Report Analytics
 * Key metrics and charts for contact analytics
 */

import React, { useMemo } from 'react';
import { Loader2, TrendingUp, Users, Tag, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ReportAnalytics({ workspaceId }) {
  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['report-contacts', workspaceId],
    queryFn: async () => {
      return await base44.entities.Client?.filter({ tenant_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Fetch tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['report-tags', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTag?.filter({ workspace_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Fetch tag assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['report-assignments', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTagAssignment?.filter({ workspace_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => c.status === 'active').length;
    const pjContacts = contacts.filter(c => c.client_type === 'pj').length;
    const pfContacts = contacts.filter(c => c.client_type === 'pf').length;
    const avgTagsPerContact = totalContacts > 0 ? (assignments.length / totalContacts).toFixed(1) : 0;
    const totalTags = tags.length;

    return {
      totalContacts,
      activeContacts,
      pjContacts,
      pfContacts,
      avgTagsPerContact,
      totalTags,
      activePercentage: totalContacts > 0 ? ((activeContacts / totalContacts) * 100).toFixed(1) : 0,
    };
  }, [contacts, tags, assignments]);

  if (contactsLoading || tagsLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Análise de Contatos
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contacts */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total de Contatos</p>
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalContacts}</p>
        </div>

        {/* Active Contacts */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Contatos Ativos</p>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.activeContacts}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{metrics.activePercentage}% do total</p>
        </div>

        {/* PJ Contacts */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pessoa Jurídica</p>
            <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.pjContacts}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{metrics.pfContacts} PF</p>
        </div>

        {/* Tags */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Tags Cadastradas</p>
            <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalTags}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{metrics.avgTagsPerContact} por contato</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* By Type */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">
            Por Tipo de Cliente
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Pessoa Jurídica</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {metrics.pjContacts}
                {metrics.totalContacts > 0 && (
                  <span className="text-xs text-slate-500 ml-2">
                    ({((metrics.pjContacts / metrics.totalContacts) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: metrics.totalContacts > 0
                    ? `${(metrics.pjContacts / metrics.totalContacts) * 100}%`
                    : '0%',
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Pessoa Física</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {metrics.pfContacts}
                {metrics.totalContacts > 0 && (
                  <span className="text-xs text-slate-500 ml-2">
                    ({((metrics.pfContacts / metrics.totalContacts) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{
                  width: metrics.totalContacts > 0
                    ? `${(metrics.pfContacts / metrics.totalContacts) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">
            Tags Mais Usadas
          </h3>
          <div className="space-y-2">
            {tags.slice(0, 5).map((tag) => {
              const count = assignments.filter(a => a.tag_id === tag.id).length;
              return (
                <div key={tag.id} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tag.name}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {count}
                  </span>
                </div>
              );
            })}
            {tags.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Nenhuma tag cadastrada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}