import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import JournalEntryForm from '../components/dashboard/JournalEntryForm';
import JournalEntryList from '../components/dashboard/JournalEntryList';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';

export default function Entries() {
  const { workspaceId, loading } = useGlobalAuth('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
     return (
       <div className="flex items-center justify-center h-96 bg-[var(--color-background-primary)]">
         <div className="text-center">
           <div className="w-10 h-10 border-4 border-[var(--color-interactive-default)] border-t-transparent rounded-full animate-spin mx-auto mb-[var(--spacing-md)]" />
           <p className="text-[var(--color-foreground-secondary)]">Carregando...</p>
         </div>
       </div>
     );
   }

   const handleSave = () => {
     setShowForm(false);
     setEditingEntry(null);
     setRefreshKey(prev => prev + 1);
   };

   const handleEdit = (entry) => {
     setEditingEntry(entry);
     setShowForm(true);
   };

   return (
     <div className="space-y-[var(--spacing-lg)] bg-[var(--color-background-primary)] pb-20 transition-colors">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[var(--spacing-md)]">
         <div>
           <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Lançamentos Contábeis</h1>
           <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar entradas de diário</p>
         </div>
         <Button 
           onClick={() => { setEditingEntry(null); setShowForm(true); }}
           className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] gap-[var(--spacing-sm)]"
           aria-label="Criar novo lançamento"
         >
           <Plus className="w-5 h-5" aria-hidden="true" />
           <span className="hidden sm:inline">Novo Lançamento</span>
           <span className="sm:hidden">Novo</span>
         </Button>
       </div>

      {showForm && (
        <JournalEntryForm
          entry={editingEntry}
          tenantId={workspaceId}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}

      <JournalEntryList
        tenantId={workspaceId}
        onEdit={handleEdit}
        onRefresh={refreshKey}
      />
    </div>
  );
}