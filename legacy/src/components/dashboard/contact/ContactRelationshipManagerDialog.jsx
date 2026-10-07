/**
 * Contact Relationship Manager Dialog
 * Manage relationships between contacts (parent-child, partners, suppliers, etc)
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const RELATIONSHIP_TYPES = [
  { value: 'matriz_filial', label: 'Matriz ↔ Filial' },
  { value: 'grupo_economico', label: 'Grupo Econômico' },
  { value: 'parceiro', label: 'Parceiro' },
  { value: 'fornecedor', label: 'Fornecedor' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'outro', label: 'Outro' },
];

export default function ContactRelationshipManagerDialog({ open, onClose, contactId, workspaceId }) {
  const [relatedContactSearch, setRelatedContactSearch] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('parceiro');
  const [selectedRelatedContact, setSelectedRelatedContact] = useState(null);
  const [isReciprocal, setIsReciprocal] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all contacts for selection
  const { data: allContacts = [] } = useQuery({
    queryKey: ['all-contacts-for-relationship', workspaceId],
    queryFn: async () => {
      return await base44.entities.Client.filter({ workspace_id: workspaceId });
    },
    enabled: open && !!workspaceId,
  });

  // Fetch existing relationships
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['contact-relationships', contactId],
    queryFn: async () => {
      return await base44.entities.ContactRelationship.filter({
        workspace_id: workspaceId,
        contact_id: contactId,
      });
    },
    enabled: open && !!contactId && !!workspaceId,
  });

  // Create relationship mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const rel = await base44.entities.ContactRelationship.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        ...data,
      });

      // If reciprocal, create reverse relationship
      if (isReciprocal) {
        await base44.entities.ContactRelationship.create({
          workspace_id: workspaceId,
          contact_id: data.related_contact_id,
          related_contact_id: contactId,
          relationship_type: data.relationship_type,
          is_reciprocal: true,
        });
      }

      return rel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-relationships', contactId] });
      setRelatedContactSearch('');
      setSelectedRelatedContact(null);
      setSelectedRelationType('parceiro');
      setIsReciprocal(true);
    },
  });

  // Delete relationship mutation
  const deleteMutation = useMutation({
    mutationFn: async (relationshipId) => {
      const relationship = relationships.find(r => r.id === relationshipId);
      
      // Delete main relationship
      await base44.entities.ContactRelationship.delete(relationshipId);

      // Delete reciprocal if exists
      if (relationship?.is_reciprocal) {
        const reciprocal = await base44.entities.ContactRelationship.filter({
          contact_id: relationship.related_contact_id,
          related_contact_id: contactId,
          relationship_type: relationship.relationship_type,
        });
        if (reciprocal.length > 0) {
          await base44.entities.ContactRelationship.delete(reciprocal[0].id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-relationships', contactId] });
      setDeleteConfirm(null);
    },
  });

  // Filter contacts for selection (exclude current contact)
  const filteredContacts = useMemo(() => {
    return allContacts
      .filter(c => c.id !== contactId)
      .filter(c =>
        c.company_name?.toLowerCase().includes(relatedContactSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(relatedContactSearch.toLowerCase())
      );
  }, [allContacts, contactId, relatedContactSearch]);

  const handleAdd = () => {
    if (!selectedRelatedContact) {
      alert('Selecione um contato');
      return;
    }
    
    // Check if relationship already exists
    const exists = relationships.some(r => r.related_contact_id === selectedRelatedContact.id);
    if (exists) {
      alert('Este relacionamento já existe');
      return;
    }

    createMutation.mutate({
      related_contact_id: selectedRelatedContact.id,
      relationship_type: selectedRelationType,
      notes: '',
    });
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Gerenciar Relacionamentos</AlertDialogTitle>
            <AlertDialogDescription>
              Crie relacionamentos entre contatos (matriz/filial, parceiros, fornecedores, etc)
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6">
            {/* Add Relationship Form */}
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <label htmlFor="rel-search" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                  Contato Relacionado
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
                  <Input
                    id="rel-search"
                    placeholder="Buscar contato..."
                    value={relatedContactSearch}
                    onChange={(e) => setRelatedContactSearch(e.target.value)}
                    className="pl-10 min-h-[44px]"
                    aria-label="Buscar contato para relacionamento"
                  />
                </div>

                {/* Dropdown */}
                {relatedContactSearch && filteredContacts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredContacts.slice(0, 8).map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => {
                          setSelectedRelatedContact(contact);
                          setRelatedContactSearch('');
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-colors"
                        aria-label={`Selecionar ${contact.company_name}`}
                      >
                        <p className="font-medium text-slate-900 dark:text-slate-100">{contact.company_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{contact.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedRelatedContact && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedRelatedContact.company_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRelatedContact.email}</p>
                </div>
              )}

              <div>
                <label htmlFor="rel-type" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                  Tipo de Relacionamento
                </label>
                <Select value={selectedRelationType} onValueChange={setSelectedRelationType}>
                  <SelectTrigger id="rel-type" className="min-h-[44px]" aria-label="Tipo de relacionamento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isReciprocal}
                  onChange={(e) => setIsReciprocal(e.target.checked)}
                  className="w-4 h-4 rounded"
                  aria-label="Criar relacionamento recíproco (bidirecional)"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  Criar relacionamento bidirecional (recíproco)
                </span>
              </label>

              <Button
                onClick={handleAdd}
                disabled={!selectedRelatedContact || createMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 min-h-[44px]"
                aria-label="Criar relacionamento"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Criar Relacionamento
                  </>
                )}
              </Button>
            </div>

            {/* Relationships List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Relacionamentos ({relationships.length})
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" aria-hidden="true" />
                </div>
              ) : relationships.length === 0 ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">Nenhum relacionamento registrado.</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                  {relationships.map(rel => {
                    const relatedContact = allContacts.find(c => c.id === rel.related_contact_id);
                    const relType = RELATIONSHIP_TYPES.find(t => t.value === rel.relationship_type);
                    
                    return (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {relatedContact?.company_name || 'Contato não encontrado'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              {relType?.label || rel.relationship_type}
                            </span>
                            {rel.is_reciprocal && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                                Bidirecional
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setDeleteConfirm(rel.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 min-h-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                          aria-label={`Deletar relacionamento com ${relatedContact?.company_name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(val) => !val && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este relacionamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}