import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle, AlertCircle, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantIsolationManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    apiQuota: 1000,
    storageQuota: 100,
    userLimit: 50
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenant-isolation', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listTenants', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error loading tenants:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createTenantMutation = useMutation({
    mutationFn: async () => {
      if (!newTenant.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createTenant', {
        workspaceId: workspaceId,
        ...newTenant
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Tenant criado');
      setNewTenant({ name: '', apiQuota: 1000, storageQuota: 100, userLimit: 50 });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['tenant-isolation', workspaceId] });
    }
  });

  return (
    <div className="space-y-6">
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do tenant"
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">API Quota</label>
                <input
                  type="number"
                  value={newTenant.apiQuota}
                  onChange={(e) => setNewTenant({ ...newTenant, apiQuota: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Storage (GB)</label>
                <input
                  type="number"
                  value={newTenant.storageQuota}
                  onChange={(e) => setNewTenant({ ...newTenant, storageQuota: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Usuários</label>
                <input
                  type="number"
                  value={newTenant.userLimit}
                  onChange={(e) => setNewTenant({ ...newTenant, userLimit: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createTenantMutation.mutate()}
                disabled={createTenantMutation.isPending}
                className="flex-1"
              >
                {createTenantMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Tenant
        </Button>
      )}

      <div className="space-y-3">
        {tenants.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum tenant configurado</p>
            </CardContent>
          </Card>
        ) : (
          tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">ID: {tenant.id}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">API Usage</p>
                      <p className="font-semibold">{tenant.apiUsage || 0}/{tenant.apiQuota}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">Storage</p>
                      <p className="font-semibold">{tenant.storageUsage || 0}/{tenant.storageQuota}GB</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">Usuários</p>
                      <p className="font-semibold">{tenant.userCount || 0}/{tenant.userLimit}</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Edit className="w-4 h-4" />
                    Editar Cotas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}