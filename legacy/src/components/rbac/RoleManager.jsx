/**
 * Role Manager
 * Create and manage roles
 */

import React, { useState } from 'react';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const PRESET_ROLES = [
  {
    name: 'Admin',
    description: 'Acesso total ao workspace',
    color: 'red',
  },
  {
    name: 'Manager',
    description: 'Gerenciar contatos e relatórios',
    color: 'blue',
  },
  {
    name: 'User',
    description: 'Visualizar e editar contatos',
    color: 'green',
  },
  {
    name: 'Viewer',
    description: 'Apenas visualização de contatos',
    color: 'gray',
  },
];

export default function RoleManager({ workspaceId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      return await base44.entities.Role?.filter({ workspace_id: workspaceId }) || [];
    },
    enabled: !!workspaceId,
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.Role?.create({
        workspace_id: workspaceId,
        name: formData.name,
        description: formData.description,
        permissions: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      setFormData({ name: '', description: '' });
      setShowForm(false);
    },
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId) => base44.entities.Role?.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Roles
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {roles.length} role{roles.length !== 1 ? 's' : ''} configurado{roles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Novo Role
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <label htmlFor="role-name" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Nome do Role
            </label>
            <Input
              id="role-name"
              placeholder="Ex: Editor"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="min-h-[44px]"
              aria-label="Nome do role"
            />
          </div>

          <div>
            <label htmlFor="role-desc" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Descrição
            </label>
            <Textarea
              id="role-desc"
              placeholder="Descreva as responsabilidades deste role..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px] resize-none"
              aria-label="Descrição do role"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!formData.name || createMutation.isPending}
              className="flex-1 min-h-[44px]"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Role'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              disabled={createMutation.isPending}
              className="min-h-[44px]"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map(role => (
          <div
            key={role.id}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {role.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 break-words">
                  {role.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 min-h-[40px]"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
                Permissões
              </Button>
              <Button
                onClick={() => setDeleteId(role.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[40px] px-3"
                aria-label="Deletar role"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(val) => !val && setDeleteId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este role? Usuários atribuídos a este role perderão acesso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}