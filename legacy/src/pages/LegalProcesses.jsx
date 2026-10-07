import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import LegalProcessForm from '../components/dashboard/LegalProcessForm';
import LegalProcessList from '../components/dashboard/LegalProcessList';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';

export default function LegalProcesses() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
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
    setEditingProcess(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleEdit = useCallback((process) => {
    setEditingProcess(process);
    setShowForm(true);
  }, []);

  const handleNewProcess = useCallback(() => {
    setEditingProcess(null);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingProcess(null);
  }, []);

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Processos Judiciais</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar processos e casos legais</p>
        </div>
        <Button
          onClick={handleNewProcess}
          className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]"
          aria-label="Criar novo processo"
        >
          <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" aria-hidden="true" />
          Novo Processo
        </Button>
      </div>

      {showForm && (
        <LegalProcessForm
          process={editingProcess}
          tenantId={workspaceId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <LegalProcessList
        tenantId={workspaceId}
        onEdit={handleEdit}
        onRefresh={refreshKey}
      />
    </div>
  );
}