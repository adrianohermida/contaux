/**
 * Payments Page
 * Complete payment management interface
 */

import React, { useState, useCallback } from 'react';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import { Button } from '@/components/ui/button';
import PaymentForm from '@/components/dashboard/PaymentForm';
import PaymentList from '@/components/dashboard/PaymentList';
import PaymentReconciliation from '@/components/dashboard/PaymentReconciliation';
import { Plus, Scale } from 'lucide-react';

export default function Payments() {
  const { user, workspaceId } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('list'); // list | reconciliation

  const handleOpenForm = useCallback(() => {
    setEditingPayment(null);
    setShowForm(true);
  }, []);

  const handleEditPayment = useCallback((payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingPayment(null);
  }, []);

  const handleSavePayment = useCallback(() => {
    handleCloseForm();
    setRefreshKey(prev => prev + 1);
  }, [handleCloseForm]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-foreground-secondary)]">
          Você precisa estar autenticado para acessar esta página
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[var(--spacing-md)]">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">
            Pagamentos
          </h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">
            Gerencie e reconcilie pagamentos de faturas
          </p>
        </div>
        <div className="flex gap-[var(--spacing-sm)] w-full sm:w-auto">
          <Button
            onClick={handleOpenForm}
            className="flex-1 sm:flex-none bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
          >
            <Plus className="w-4 h-4 mr-[var(--spacing-sm)]" />
            Novo Pagamento
          </Button>
          <Button
            onClick={() => setActiveTab(activeTab === 'list' ? 'reconciliation' : 'list')}
            variant="outline"
            className="flex-1 sm:flex-none border-[var(--color-border-default)] text-[var(--color-foreground-primary)]"
          >
            <Scale className="w-4 h-4 mr-[var(--spacing-sm)]" />
            {activeTab === 'list' ? 'Reconciliar' : 'Ver Pagamentos'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-[var(--spacing-md)] border-b border-[var(--color-border-default)]">
        <button
           onClick={() => setActiveTab('list')}
           className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] border-b-2 font-medium transition-colors ${
             activeTab === 'list'
               ? 'border-[var(--color-interactive-default)] text-[var(--color-interactive-default)]'
               : 'border-transparent text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
           }`}
         >
           Histórico de Pagamentos
         </button>
         <button
           onClick={() => setActiveTab('reconciliation')}
           className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] border-b-2 font-medium transition-colors ${
             activeTab === 'reconciliation'
               ? 'border-[var(--color-interactive-default)] text-[var(--color-interactive-default)]'
               : 'border-transparent text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
           }`}
         >
           Reconciliação
         </button>
        </div>

        {/* Content */}
        <div className="bg-[var(--color-background-primary)] rounded-lg shadow">
         {activeTab === 'list' ? (
           <div className="p-[var(--spacing-lg)]">
            <PaymentList
              tenantId={workspaceId}
              onEdit={handleEditPayment}
              onRefresh={refreshKey}
            />
          </div>
        ) : (
          <PaymentReconciliation tenantId={workspaceId} />
        )}
      </div>

      {/* Payment Form Modal */}
      <PaymentForm
        payment={editingPayment}
        tenantId={workspaceId}
        isOpen={showForm}
        onSave={handleSavePayment}
        onCancel={handleCloseForm}
      />
    </div>
  );
}