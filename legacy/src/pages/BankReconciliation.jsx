import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BankReconciliationForm from '../components/dashboard/BankReconciliationForm';
import BankReconciliationList from '../components/dashboard/BankReconciliationList';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';

export default function BankReconciliation() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingRecon, setEditingRecon] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  const handleSave = () => {
    setShowForm(false);
    setEditingRecon(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-[var(--spacing-lg)]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Conciliação Bancária</h1>
              <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Reconciliar transações bancárias</p>
            </div>
            <Button 
              onClick={() => { setEditingRecon(null); setShowForm(true); }}
              className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
            >
              <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" />
              Nova Conciliação
            </Button>
          </div>

          {showForm && (
            <BankReconciliationForm
              recon={editingRecon}
              tenantId={workspaceId}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingRecon(null); }}
            />
          )}

          <BankReconciliationList
            tenantId={workspaceId}
            onEdit={(recon) => { setEditingRecon(recon); setShowForm(true); }}
            onRefresh={refreshKey}
          />
        </div>
        );
        }