import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook que encapsula operações CRUD de contatos
 * Consolida lógica duplicada entre componentes
 */
export function useContactService(workspaceId) {
  const queryClient = useQueryClient();

  // ===== QUERIES =====
  const listQuery = useQuery({
    queryKey: ['contacts', workspaceId],
    queryFn: () => base44.entities.Client.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });

  const getContactQuery = (contactId) =>
    useQuery({
      queryKey: ['contact', contactId],
      queryFn: () => base44.entities.Client.read(contactId),
      enabled: !!contactId,
    });

  // ===== MUTATIONS =====
  const createMutation = useMutation({
    mutationFn: (contactData) => base44.entities.Client.create(contactData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }) =>
      Promise.all(ids.map(id => base44.entities.Client.update(id, { status }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) =>
      Promise.all(ids.map(id => base44.entities.Client.delete(id))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  // ===== HELPER FUNCTIONS =====
  const createContact = useCallback((data) => {
    return createMutation.mutateAsync({
      workspace_id: workspaceId,
      ...data,
    });
  }, [workspaceId, createMutation]);

  const updateContact = useCallback((id, data) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteContact = useCallback((id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const bulkUpdateStatus = useCallback((ids, newStatus) => {
    return bulkUpdateMutation.mutateAsync({ ids, status: newStatus });
  }, [bulkUpdateMutation]);

  const bulkDelete = useCallback((ids) => {
    return bulkDeleteMutation.mutateAsync(ids);
  }, [bulkDeleteMutation]);

  return {
    // Queries
    contacts: listQuery.data || [],
    isLoadingContacts: listQuery.isLoading,
    contactsError: listQuery.error,
    getContact: getContactQuery,

    // Mutations
    createContact,
    updateContact,
    deleteContact,
    bulkUpdateStatus,
    bulkDelete,

    // Status
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}