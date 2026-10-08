import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ChartOfAccountsForm from '../components/dashboard/ChartOfAccountsForm';
import ChartOfAccountsList from '../components/dashboard/ChartOfAccountsList';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';

export default function ChartOfAccounts() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
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
    setEditingAccount(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Plano de Contas</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar contas contábeis</p>
        </div>
        <Button 
          onClick={() => { setEditingAccount(null); setShowForm(true); }}
          className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
        >
          <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" />
          Nova Conta
        </Button>
      </div>

      {showForm && (
         <ChartOfAccountsForm
           account={editingAccount}
           tenantId={workspaceId}
           onSave={handleSave}
           onCancel={() => { setShowForm(false); setEditingAccount(null); }}
         />
       )}

       <ChartOfAccountsList
         tenantId={workspaceId}
         onEdit={handleEdit}
         onRefresh={refreshKey}
       />
    </div>
  );
}