import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import InvoiceForm from '../components/dashboard/InvoiceForm';
import InvoiceList from '../components/dashboard/InvoiceList';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';

export default function Invoicing() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  const handleSave = useCallback(() => {
    setShowForm(false);
    setEditingInvoice(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleEdit = useCallback((invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  }, []);

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Faturamento</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar faturas e faturamento</p>
        </div>
        <Button
          onClick={() => { setEditingInvoice(null); setShowForm(true); }}
          className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]"
          aria-label="Criar nova fatura"
        >
          <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" aria-hidden="true" />
          Nova Fatura
        </Button>
      </div>

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          tenantId={workspaceId}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingInvoice(null); }}
        />
      )}

      <InvoiceList
        tenantId={workspaceId}
        onEdit={handleEdit}
        onRefresh={refreshKey}
      />
    </div>
  );
}