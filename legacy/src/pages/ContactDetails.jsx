import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';
import ProtectedInternalRoute from '../components/auth/ProtectedInternalRoute';
import { useToast } from '../components/hooks/useToast';
import { ToastContainer } from '../components/ui/toast-notification';
import { useDebounce } from '../components/hooks/useDebounce';
import { sanitizeInput } from '../components/security/InputValidator';
import { useCSRFToken } from '../components/security/CSRFProtection';
import { validateContactForm, validateEmailUniqueness } from '@/functions/validators';
import ContactRouteValidator from '../components/dashboard/ContactRouteValidator';
import ContactDetailsHeader from '../components/dashboard/contactdetails/ContactDetailsHeader';
import ContactDetailsTabs from '../components/dashboard/contactdetails/ContactDetailsTabs';
import ContactEditForm from '../components/dashboard/contactdetails/ContactEditForm';
import ContactTagManagerDialog from '../components/dashboard/contact/ContactTagManagerDialog';
import ContactRelationshipManagerDialog from '../components/dashboard/contact/ContactRelationshipManagerDialog';
import ContactAttachmentsDialog from '../components/dashboard/contact/ContactAttachmentsDialog';
import { useContactForm } from '../components/dashboard/contactdetails/useContactForm';

export default function ContactDetails() {
   const { contactId } = useParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { workspaceId, loading: authLoading } = useMultitenantAuthOptimized('internal');
   const { toasts, removeToast, success, error, info } = useToast();
   const { token } = useCSRFToken();

   const [isEditing, setIsEditing] = useState(contactId === 'new');
   const [showTagManager, setShowTagManager] = useState(false);
   const [showRelationshipManager, setShowRelationshipManager] = useState(false);
   const [showAttachments, setShowAttachments] = useState(false);

   // Fetch contact if not new
   const { data: contact, isLoading, error: queryError } = useQuery({
     queryKey: ['contact-detail', contactId, workspaceId],
     queryFn: async () => {
       if (!contactId || contactId === 'new' || !workspaceId) return null;
       const data = await base44.entities.Client.get(contactId);
       if (data?.tenant_id !== workspaceId) throw new Error('Acesso negado');
       return data;
     },
     enabled: !authLoading && contactId !== 'new' && !!workspaceId,
     staleTime: 5 * 60 * 1000,
   });

   // Initialize form with defaults
   const getInitialFormData = () => {
     if (contact) return contact;
     if (contactId === 'new') {
       return {
         company_name: '', email: '', phone: '', client_type: 'pj', status: 'active',
         cnpj: '', cpf: '', endereco: '', numero: '', complemento: '', bairro: '',
         cidade: '', uf: '', cep: '', currency: 'BRL', tenant_id: workspaceId,
       };
     }
     return null;
   };

   const { formData, setFormData, errors, hasChanges, handleInputChange, validateForm, reset } = useContactForm(
     getInitialFormData(),
     contactId,
     workspaceId,
     base44,
     (msg) => info(msg),
     (msg) => error(msg)
   );

   // Handle unsaved changes warning
   useEffect(() => {
     const handleBeforeUnload = (e) => {
       if (hasChanges) {
         e.preventDefault();
         e.returnValue = '';
       }
     };
     window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
   }, [hasChanges]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!token) throw new Error('CSRF token missing');
      if (!workspaceId) throw new Error('Workspace ID required');
      if (!data.company_name?.trim()) throw new Error('Nome/Empresa é obrigatório');
      if (!data.email?.trim()) throw new Error('Email é obrigatório');

      const sanitizedData = {
        ...data,
        company_name: sanitizeInput(data.company_name, 'text'),
        email: sanitizeInput(data.email, 'email'),
        phone: sanitizeInput(data.phone, 'phone'),
        tenant_id: workspaceId,
      };

      if (contactId === 'new') {
        const result = await base44.entities.Client.create(sanitizedData);
        await base44.entities.ContactActivity.create({
          workspace_id: workspaceId,
          contact_id: result.id,
          activity_type: 'created',
          description: 'Contato criado',
          metadata: { initial_status: data.status, client_type: data.client_type },
        });
        return result;
      } else {
        const statusChanged = contact.status !== data.status;
        await base44.entities.Client.update(contactId, sanitizedData);

        await base44.entities.ContactActivity.create({
          workspace_id: workspaceId,
          contact_id: contactId,
          activity_type: 'edit',
          description: 'Informações do contato editadas',
          metadata: { fields_updated: Object.keys(sanitizedData).filter(key => contact[key] !== sanitizedData[key]) },
        });

        if (statusChanged) {
          await base44.entities.ContactActivity.create({
            workspace_id: workspaceId,
            contact_id: contactId,
            activity_type: 'status_change',
            description: `Status alterado de ${contact.status === 'active' ? 'Ativo' : 'Inativo'} para ${data.status === 'active' ? 'Ativo' : 'Inativo'}`,
            metadata: { old_status: contact.status, new_status: data.status },
          });
        }
        return { id: contactId, ...data };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contact-detail', contactId, workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities', contactId, workspaceId] });
      setIsEditing(false);
      success('Contato salvo com sucesso!');
      if (contactId === 'new') navigate(`/contact/${result.id}`);
    },
    onError: (err) => error(err.message || 'Erro ao salvar contato'),
  });

  const handleSave = async () => {
    if (!(await validateForm())) return;
    if (saveMutation.isPending) return;
    try {
      await saveMutation.mutateAsync(formData);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  const handleCancel = () => {
    if (contactId === 'new') {
      navigate('/contact');
    } else {
      reset(contact);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedInternalRoute>
        <div className="flex items-center justify-center py-12 px-4" role="status" aria-live="polite" aria-label="Carregando contato">
          <Loader2 className="w-6 h-6 animate-spin mr-2 flex-shrink-0" aria-hidden="true" />
          <span className="text-slate-600 dark:text-slate-400">Carregando contato...</span>
        </div>
      </ProtectedInternalRoute>
    );
  }

  const routeErrorElement = ContactRouteValidator({ contactId, isLoading, error: queryError, contact, onNavigateBack: () => navigate('/contact') });
  if (routeErrorElement) {
    return <ProtectedInternalRoute>{routeErrorElement}</ProtectedInternalRoute>;
  }

  if (!formData) return null;

  return (
    <ProtectedInternalRoute>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 pb-12">
        <ContactDetailsHeader 
          isEditing={isEditing} 
          contactId={contactId} 
          formData={formData}
          onBack={() => navigate('/contact')}
          onOpenTagManager={() => setShowTagManager(true)}
          onOpenRelationshipManager={() => setShowRelationshipManager(true)}
          onOpenAttachments={() => setShowAttachments(true)}
        />

        {contactId !== 'new' && !isEditing && contact && (
          <ContactDetailsTabs 
            contact={contact}
            contactId={contactId}
            workspaceId={workspaceId}
            formData={formData}
            onEditClick={() => setIsEditing(true)}
          />
        )}

        {(isEditing || contactId === 'new') && (
          <ContactEditForm
            formData={formData}
            errors={errors}
            isEditing={isEditing}
            contactId={contactId}
            contact={contact}
            workspaceId={workspaceId}
            isSaving={saveMutation.isPending}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={() => navigate('/contact')}
          />
        )}

        {contactId !== 'new' && (
          <>
            <ContactTagManagerDialog
              open={showTagManager}
              onClose={() => setShowTagManager(false)}
              workspaceId={workspaceId}
            />

            <ContactRelationshipManagerDialog
              open={showRelationshipManager}
              onClose={() => setShowRelationshipManager(false)}
              contactId={contactId}
              workspaceId={workspaceId}
            />

            <ContactAttachmentsDialog
              open={showAttachments}
              onClose={() => setShowAttachments(false)}
              contactId={contactId}
              workspaceId={workspaceId}
            />
          </>
        )}
      </div>
    </ProtectedInternalRoute>
  );
}