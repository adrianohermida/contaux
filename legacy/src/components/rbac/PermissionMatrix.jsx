/**
 * Permission Matrix
 * Visual matrix for managing role-based permissions
 */

import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const RESOURCES = [
  { id: 'contacts', label: 'Contatos', actions: ['create', 'read', 'update', 'delete', 'export'] },
  { id: 'tags', label: 'Tags', actions: ['create', 'read', 'update', 'delete'] },
  { id: 'reports', label: 'Relatórios', actions: ['create', 'read', 'update', 'delete', 'export'] },
  { id: 'webhooks', label: 'Webhooks', actions: ['create', 'read', 'update', 'delete'] },
  { id: 'users', label: 'Usuários', actions: ['read', 'update', 'delete', 'invite'] },
  { id: 'settings', label: 'Configurações', actions: ['read', 'update'] },
];

export default function PermissionMatrix({ workspaceId, roleId }) {
  const [permissions, setPermissions] = useState({});
  const queryClient = useQueryClient();

  // Fetch role permissions
  const { data: role, isLoading } = useQuery({
    queryKey: ['role-permissions', workspaceId, roleId],
    queryFn: async () => {
      const foundRole = await base44.entities.Role?.get(roleId);
      setPermissions(foundRole?.permissions || {});
      return foundRole;
    },
    enabled: !!workspaceId && !!roleId,
  });

  // Update permissions mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      base44.entities.Role?.update(roleId, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', workspaceId] });
    },
  });

  const handleTogglePermission = (resource, action) => {
    const key = `${resource}:${action}`;
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (resource) => {
    const resourcePerms = RESOURCES.find(r => r.id === resource);
    const allSelected = resourcePerms.actions.every(
      action => permissions[`${resource}:${action}`]
    );

    const newPerms = { ...permissions };
    resourcePerms.actions.forEach(action => {
      newPerms[`${resource}:${action}`] = !allSelected;
    });
    setPermissions(newPerms);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando permissões...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {role?.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configure quais ações este role pode realizar
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">
                Recurso
              </th>
              {RESOURCES[0]?.actions.map(action => (
                <th key={action} className="text-center p-3 font-medium text-slate-600 dark:text-slate-400">
                  <span className="capitalize text-xs">{action}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map(resource => (
              <tr key={resource.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3">
                  <button
                    onClick={() => handleSelectAll(resource.id)}
                    className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100 hover:opacity-75 transition-opacity"
                    aria-label={`Alternar todos para ${resource.label}`}
                  >
                    <Checkbox
                      checked={resource.actions.every(
                        action => permissions[`${resource.id}:${action}`]
                      )}
                      onChange={() => handleSelectAll(resource.id)}
                    />
                    {resource.label}
                  </button>
                </td>
                {resource.actions.map(action => (
                  <td key={`${resource.id}:${action}`} className="text-center p-3">
                    <Checkbox
                      checked={permissions[`${resource.id}:${action}`] || false}
                      onChange={() => handleTogglePermission(resource.id, action)}
                      aria-label={`${action} em ${resource.label}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="gap-2 min-h-[44px]"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Salvar Permissões
            </>
          )}
        </Button>
      </div>
    </div>
  );
}