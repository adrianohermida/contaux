import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const PERMISSIONS = {
  'read': { label: 'Ler', description: 'Visualizar dados' },
  'create': { label: 'Criar', description: 'Criar novos registros' },
  'update': { label: 'Editar', description: 'Modificar registros' },
  'delete': { label: 'Deletar', description: 'Remover registros' },
  'export': { label: 'Exportar', description: 'Exportar dados' },
  'admin': { label: 'Admin', description: 'Acesso total' }
};

const ROLES = {
  'admin': { permissions: ['read', 'create', 'update', 'delete', 'export', 'admin'], color: 'red' },
  'manager': { permissions: ['read', 'create', 'update', 'export'], color: 'blue' },
  'analyst': { permissions: ['read', 'export'], color: 'green' },
  'viewer': { permissions: ['read'], color: 'slate' }
};

export default function RoleBasedAccess({ workspaceId }) {
  const queryClient = useQueryClient();
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['workspace-users', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.User.list() || [];
    },
    enabled: !!workspaceId
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, permissions }) => {
      return base44.auth.updateMe({
        role: role,
        permissions: permissions
      });
    },
    onSuccess: () => {
      toast.success('Permissões atualizadas');
      queryClient.invalidateQueries({ queryKey: ['workspace-users', workspaceId] });
    }
  });

  const togglePermission = (permission) => {
    setNewRole({
      ...newRole,
      permissions: newRole.permissions.includes(permission)
        ? newRole.permissions.filter(p => p !== permission)
        : [...newRole.permissions, permission]
    });
  };

  return (
    <div className="space-y-6">
      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLES).map(([key, role]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="font-medium text-slate-900 capitalize mb-1">{key}</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {role.permissions.map(perm => (
                    <span key={perm} className="px-2 py-1 bg-slate-100 text-xs rounded">
                      {PERMISSIONS[perm].label}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Custom Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Papel Customizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Nome do papel"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Permissões</p>
            {Object.entries(PERMISSIONS).map(([key, perm]) => (
              <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRole.permissions.includes(key)}
                  onChange={() => togglePermission(key)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{perm.label}</p>
                  <p className="text-xs text-slate-600">{perm.description}</p>
                </div>
              </label>
            ))}
          </div>

          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Criar Papel
          </Button>
        </CardContent>
      </Card>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role || 'viewer'}
                    onChange={(e) => updateRoleMutation.mutate({
                      userId: user.id,
                      role: e.target.value,
                      permissions: ROLES[e.target.value]?.permissions || []
                    })}
                    disabled={updateRoleMutation.isPending}
                    className="px-2 py-1 border border-slate-300 rounded text-xs"
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="analyst">Analista</option>
                    <option value="manager">Gerenciador</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="p-1 hover:bg-slate-200 rounded">
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-1 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}