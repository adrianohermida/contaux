import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProtectedRoute from '../components/dashboard/ProtectedRoute';
import ManualPostingForm from '../components/dashboard/ManualPostingForm';
import ManualPostingList from '../components/dashboard/ManualPostingList';
import { Button } from '@/components/ui/button';

export default function ManualPosting() {
  const [showForm, setShowForm] = useState(false);
  const [editingPosting, setEditingPosting] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const getCurrentTenant = async () => {
      try {
        const user = await base44.auth.me();
        setTenantId(user.email.split('@')[0]);
      } catch (error) {
        console.error('Erro ao obter tenant:', error);
      }
    };
    getCurrentTenant();
  }, []);

  const handleSave = () => {
    setShowForm(false);
    setEditingPosting(null);
    setRefreshKey(prev => prev + 1);
  };

  if (!tenantId) return <ProtectedRoute><DashboardLayout><div className="text-center py-[var(--spacing-lg)]">Carregando...</div></DashboardLayout></ProtectedRoute>;

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Baixa Manual</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Registrar baixa manual de documentos</p>
        </div>
        <Button 
          onClick={() => { setEditingPosting(null); setShowForm(true); }}
          className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
        >
          <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" />
          Nova Baixa
        </Button>
      </div>

      {showForm && (
        <ManualPostingForm
          tenantId={tenantId}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPosting(null); }}
        />
      )}

      <ManualPostingList
        tenantId={tenantId}
        onEdit={(posting) => { setEditingPosting(posting); setShowForm(true); }}
        onRefresh={refreshKey}
      />
    </div>
  );
}