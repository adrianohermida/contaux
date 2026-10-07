import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RelationshipsHeader from './relationships/RelationshipsHeader';
import RelationshipsList from './relationships/RelationshipsList';
import RelationshipDialog from './relationships/RelationshipDialog';

export default function ContactRelationshipManager({ contactId, workspaceId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [relationshipType, setRelationshipType] = useState('parceiro');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch relationships
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['contact-relationships', contactId],
    queryFn: async () => {
      const outgoing = await base44.entities.ContactRelationship.filter({ contact_id: contactId });
      const incoming = await base44.entities.ContactRelationship.filter({ related_contact_id: contactId });
      return [...outgoing, ...incoming];
    },
    enabled: !!contactId,
  });

  // Fetch all contacts for search
  const { data: allContacts = [] } = useQuery({
    queryKey: ['contacts-search', workspaceId],
    queryFn: () => base44.entities.Client.filter({ tenant_id: workspaceId }),
    enabled: !!workspaceId && showDialog,
  });

  // Get related contacts details
  const relatedContactIds = [
    ...relationships.filter(r => r.contact_id === contactId).map(r => r.related_contact_id),
    ...relationships.filter(r => r.related_contact_id === contactId).map(r => r.contact_id),
  ];

  const { data: relatedContacts = [] } = useQuery({
    queryKey: ['related-contacts', relatedContactIds],
    queryFn: async () => {
      const contacts = await Promise.all(
        relatedContactIds.map(id => base44.entities.Client.get(id))
      );
      return contacts;
    },
    enabled: relatedContactIds.length > 0,
  });

  const createRelationshipMutation = useMutation({
    mutationFn: async ({ relatedContactId, type, notes }) => {
      const relationship = await base44.entities.ContactRelationship.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        related_contact_id: relatedContactId,
        relationship_type: type,
        notes: notes || '',
        is_reciprocal: true,
      });

      // Create activity
      const contact = relatedContacts.find(c => c.id === relatedContactId);
      await base44.entities.ContactActivity.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        activity_type: 'edit',
        description: `Relacionamento criado com ${contact?.company_name || 'contato'}`,
        metadata: {
          relationship_id: relationship.id,
          relationship_type: type,
          related_contact_id: relatedContactId,
        },
      });

      return relationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
      handleCloseDialog();
    },
  });

  const deleteRelationshipMutation = useMutation({
    mutationFn: async (relationshipId) => {
      await base44.entities.ContactRelationship.delete(relationshipId);

      // Create activity
      await base44.entities.ContactActivity.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        activity_type: 'edit',
        description: 'Relacionamento removido',
        metadata: { relationship_id: relationshipId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
    },
  });

  const handleCloseDialog = useCallback(() => {
    setShowDialog(false);
    setSelectedContact(null);
    setSearchTerm('');
    setRelationshipType('parceiro');
    setNotes('');
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedContact) return;
    createRelationshipMutation.mutate({
      relatedContactId: selectedContact.id,
      type: relationshipType,
      notes,
    });
  }, [selectedContact, relationshipType, notes, createRelationshipMutation]);

  const availableContacts = allContacts
    .filter(c => c.id !== contactId)
    .filter(c => !relatedContactIds.includes(c.id))
    .filter(c => c.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <RelationshipsHeader onAdd={() => setShowDialog(true)} />

      {isLoading ? (
        <p className="text-center text-slate-500 py-8">Carregando...</p>
      ) : (
        <RelationshipsList
          relationships={relationships}
          relatedContacts={relatedContacts}
          contactId={contactId}
          onDelete={(id) => deleteRelationshipMutation.mutate(id)}
          onAdd={() => setShowDialog(true)}
        />
      )}

      <RelationshipDialog
        open={showDialog}
        onClose={handleCloseDialog}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableContacts={availableContacts}
        selectedContact={selectedContact}
        onSelectContact={(contact) => {
          setSelectedContact(contact);
          setSearchTerm('');
        }}
        relationshipType={relationshipType}
        onRelationshipTypeChange={setRelationshipType}
        notes={notes}
        onNotesChange={setNotes}
        onCreate={handleCreate}
        isCreating={createRelationshipMutation.isPending}
      />
    </div>
  );
}