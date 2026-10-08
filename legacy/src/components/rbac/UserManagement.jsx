/**
 * User Management
 * Manage workspace users and their roles
 */

import React, { useState } from 'react';
import { Loader2, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UserManagement({ workspaceId }) {
  const [removeId, setRemoveId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch workspace users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['workspace-users', workspaceId],
    queryFn: async () => {
      return await base44.entities.User?.filter({ workspace_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      return await base44.entities.Role?.filter({ workspace_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) =>
      base44.entities.User?.update(userId, { role_id: roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-users', workspaceId] });
    },
  });

  // Remove user mutation
  const removeMutation = useMutation({
    mutationFn: (userId) => base44.entities.User?.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-users', workspaceId] });
      setRemoveId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Usuários do Workspace
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {users.length} usuário{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <Shield className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhum usuário no workspace
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">
                  Usuário
                </th>
                <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">
                  Email
                </th>
                <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">
                  Role
                </th>
                <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">
                  Adicionado
                </th>
                <th className="text-center p-3 font-medium text-slate-900 dark:text-slate-100">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                    {user.full_name}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 break-all">
                    {user.email}
                  </td>
                  <td className="p-3">
                    <Select
                      value={user.role_id || ''}
                      onValueChange={(roleId) =>
                        updateRoleMutation.mutate({ userId: user.id, roleId })
                      }
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-32 min-h-[40px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(user.created_date), 'dd MMM', { locale: ptBR })}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      onClick={() => setRemoveId(user.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                      aria-label="Remover usuário"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remove Confirmation */}
      <AlertDialog open={!!removeId} onOpenChange={(val) => !val && setRemoveId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Este usuário perderá acesso ao workspace. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMutation.mutate(removeId)}
              disabled={removeMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}