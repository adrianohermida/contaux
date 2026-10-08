import React, { useState } from 'react';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import LoyaltyProgramForm from '@/components/dashboard/LoyaltyProgramForm';
import LoyaltyProgramList from '@/components/dashboard/LoyaltyProgramList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function LoyaltyProgramsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const { workspaceId } = useGlobalAuth();

  const handleEdit = (program) => {
    setEditingProgram(program);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProgram(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Programas de Fidelização
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gerencie seus programas de recompensa e fidelização de clientes
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 whitespace-nowrap"
            aria-label="Create new loyalty program"
          >
            <Plus className="w-5 h-5" />
            Novo Programa
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
          <LoyaltyProgramList
            workspaceId={workspaceId}
            onEdit={handleEdit}
          />
        </div>
      </div>

      {/* Form Modal */}
      <LoyaltyProgramForm
        program={editingProgram}
        workspaceId={workspaceId}
        isOpen={showForm}
        onCancel={handleFormClose}
        onSubmit={handleFormClose}
      />
    </div>
  );
}