/**
 * Quotes Page
 * Main interface for managing quotes
 */

import React, { useState } from 'react';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import QuoteForm from '@/components/dashboard/QuoteForm';
import QuoteList from '@/components/dashboard/QuoteList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function QuotesPage() {
  const { user, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
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
    setEditingQuote(null);
    setRefreshKey(k => k + 1);
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  return (
    <div className="space-y-[var(--spacing-lg)] min-h-screen p-[var(--spacing-lg)]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Cotações</h1>
          <p className="text-[var(--color-foreground-secondary)]">Gerenciar e converter cotações em faturas</p>
        </div>
        <Button
          onClick={() => {
            setEditingQuote(null);
            setShowForm(true);
          }}
          className="gap-[var(--spacing-sm)] bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
        >
          <Plus className="w-5 h-5" />
          Nova Cotação
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <QuoteForm
          quote={editingQuote}
          tenantId={user.workspace_id}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingQuote(null);
          }}
          isOpen={showForm}
        />
      )}

      {/* List */}
       <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
        <QuoteList
          key={refreshKey}
          tenantId={user.workspace_id}
          onEdit={handleEdit}
          onRefresh={() => setRefreshKey(k => k + 1)}
        />
      </div>
    </div>
  );
}