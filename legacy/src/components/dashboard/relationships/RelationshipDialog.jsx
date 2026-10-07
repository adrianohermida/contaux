import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const RELATIONSHIP_TYPES = {
  matriz_filial: 'Matriz/Filial',
  grupo_economico: 'Grupo Econômico',
  parceiro: 'Parceiro',
  fornecedor: 'Fornecedor',
  cliente: 'Cliente',
  outro: 'Outro',
};

export default function RelationshipDialog({
  open,
  onClose,
  searchTerm,
  onSearchChange,
  availableContacts,
  selectedContact,
  onSelectContact,
  relationshipType,
  onRelationshipTypeChange,
  notes,
  onNotesChange,
  onCreate,
  isCreating
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Relacionamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Buscar Contato</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Digite o nome do contato..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="max-h-48 overflow-auto border rounded-lg">
              {availableContacts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum contato encontrado
                </p>
              ) : (
                availableContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <p className="text-sm font-medium">{contact.company_name}</p>
                    <p className="text-xs text-slate-500">{contact.email}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedContact && (
            <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm font-medium">{selectedContact.company_name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedContact.email}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Relacionamento</label>
            <select
              value={relationshipType}
              onChange={(e) => onRelationshipTypeChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-slate-800"
            >
              {Object.entries(RELATIONSHIP_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
            <Input
              placeholder="Detalhes sobre o relacionamento..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={!selectedContact || isCreating}
          >
            {isCreating ? 'Criando...' : 'Criar Relacionamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}