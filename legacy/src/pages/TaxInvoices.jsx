import React, { useState } from 'react';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';
import TaxInvoicesTable from '../components/dashboard/TaxInvoicesTable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaxInvoices() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  const handleCreateNFe = () => {
    // TODO: Abrir modal para criar nova NFe
    alert('Modal para criar nova NFe - em desenvolvimento');
  };

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Notas Fiscais Eletrônicas</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar NFes e integração com Sefaz</p>
        </div>
        <Button onClick={handleCreateNFe} className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] gap-[var(--spacing-sm)]">
          <Plus className="w-5 h-5" />
          Nova NFe
        </Button>
      </div>

      <TaxInvoicesTable
        tenantId={workspaceId}
        onEdit={() => {}}
        onRefresh={refreshKey}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}