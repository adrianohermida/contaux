import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import TicketForm from '../components/dashboard/TicketForm';
import TicketList from '../components/dashboard/TicketList';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';

export default function Tickets() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
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
    setEditingTicket(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleEdit = useCallback((ticket) => {
    setEditingTicket(ticket);
    setShowForm(true);
  }, []);

  const handleNewTicket = useCallback(() => {
    setEditingTicket(null);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingTicket(null);
  }, []);

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Helpdesk - Tickets</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar solicitações de suporte</p>
        </div>
        <Button
          onClick={handleNewTicket}
          className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
          aria-label="Criar novo ticket"
        >
          <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" aria-hidden="true" />
          Novo Ticket
        </Button>
      </div>

      {showForm && (
        <TicketForm
          ticket={editingTicket}
          tenantId={workspaceId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <TicketList
        tenantId={workspaceId}
        onEdit={handleEdit}
        onRefresh={refreshKey}
      />
    </div>
  );
}