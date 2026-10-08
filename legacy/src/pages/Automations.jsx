import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import AutomationsList from '../components/dashboard/AutomationsList';
import AutomationsForm from '../components/dashboard/AutomationsForm';
import { Button } from '@/components/ui/button';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';

export default function Automations() {
  const { workspaceId, loading } = useMultitenantAuthOptimized('internal');
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  if (loading) {
     return (
       <div className="flex items-center justify-center h-96">
         <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
       </div>
     );
   }

   const handleSave = () => {
     setShowForm(false);
     setEditingWorkflow(null);
     setRefreshKey(prev => prev + 1);
     toast.success('Automação salva com sucesso');
   };

   return (
     <div className="space-y-[var(--spacing-lg)]">
       <div className="flex justify-between items-center">
         <div>
           <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Automações</h1>
           <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar fluxos automáticos</p>
         </div>
         <Button onClick={() => setShowForm(true)} className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]">
           <Plus className="w-5 h-5 mr-[var(--spacing-sm)]" />
           Nova Automação
         </Button>
       </div>

      {showForm && (
        <AutomationsForm
          workflow={editingWorkflow}
          tenantId={workspaceId}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingWorkflow(null); }}
        />
      )}

      <AutomationsList
        tenantId={workspaceId}
        onEdit={(workflow) => { setEditingWorkflow(workflow); setShowForm(true); }}
        onRefresh={refreshKey}
      />
    </div>
  );
}