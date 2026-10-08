/**
 * Sales Page
 * Main interface for managing sales opportunities and pipeline
 */

import React, { useState } from 'react';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import SalesOpportunityForm from '@/components/dashboard/SalesOpportunityForm';
import SalesOpportunityList from '@/components/dashboard/SalesOpportunityList';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';

export default function SalesPage() {
  const { user, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="p-[var(--spacing-2xl)] text-center text-[var(--color-foreground-secondary)]">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-[var(--spacing-2xl)] text-center text-[var(--color-error)]">
        Acesso restrito a usuários internos
      </div>
    );
  }

  const handleSave = () => {
    setShowForm(false);
    setEditingOpportunity(null);
    setRefreshKey(k => k + 1);
  };

  const handleEdit = (opportunity) => {
    setEditingOpportunity(opportunity);
    setShowForm(true);
  };

  return (
    <div className="space-y-[var(--spacing-lg)] min-h-screen p-[var(--spacing-lg)]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)] flex items-center gap-[var(--spacing-sm)]">
            <TrendingUp className="w-8 h-8 text-[var(--color-interactive-default)]" />
            Pipeline de Vendas
          </h1>
          <p className="text-[var(--color-foreground-secondary)]">Gerenciar oportunidades e rastrear vendas</p>
        </div>
        <Button
          onClick={() => {
            setEditingOpportunity(null);
            setShowForm(true);
          }}
          className="gap-[var(--spacing-sm)] bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
        >
          <Plus className="w-5 h-5" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <SalesOpportunityForm
          opportunity={editingOpportunity}
          workspaceId={user.workspace_id}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingOpportunity(null);
          }}
          isOpen={showForm}
        />
      )}

      {/* List */}
      <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
        <SalesOpportunityList
          key={refreshKey}
          workspaceId={user.workspace_id}
          onEdit={handleEdit}
          onRefresh={() => setRefreshKey(k => k + 1)}
        />
      </div>
    </div>
  );
}