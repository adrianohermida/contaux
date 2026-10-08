import React from 'react';
import { Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormField from '../../modals/FormField';
import ContactDeleteButton from '../ContactDeleteButton';
import ContactMetadata from '../ContactMetadata';
import ContactCEPLookup from '../ContactCEPLookup';
import ContactCustomFields from '../ContactCustomFields';
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
} from '@/functions/formatters';
import {
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
} from '@/functions/validators';

export default function ContactEditForm({
  formData,
  errors,
  isEditing,
  contactId,
  contact,
  workspaceId,
  isSaving,
  onInputChange,
  onSave,
  onCancel,
  onDelete
}) {
  if (!formData) return null;

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>Informações do Contato</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <fieldset className="space-y-4 border-0">
            <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Informações Básicas</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              label="Nome da Empresa"
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={onInputChange}
              disabled={!isEditing}
              error={errors.company_name}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              disabled={!isEditing}
              error={errors.email}
            />
            <FormField
              label="Telefone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={onInputChange}
              disabled={!isEditing}
              error={errors.phone}
            />
            <div>
              <label htmlFor="client_type" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Tipo
              </label>
              <select
                id="client_type"
                name="client_type"
                value={formData.client_type}
                onChange={onInputChange}
                disabled={!isEditing}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Tipo de cliente"
              >
                <option value="pf">Pessoa Física</option>
                <option value="pj">Pessoa Jurídica</option>
              </select>
            </div>
            </div>
          </fieldset>

          {/* Document Info */}
          <fieldset className="space-y-4 border-0">
            <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Documentação</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {formData.client_type === 'pf' ? (
              <FormField
                label="CPF"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={onInputChange}
                disabled={!isEditing}
                error={errors.cpf}
              />
            ) : (
              <FormField
                label="CNPJ"
                name="cnpj"
                type="text"
                value={formData.cnpj}
                onChange={onInputChange}
                disabled={!isEditing}
                error={errors.cnpj}
              />
            )}
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={onInputChange}
                disabled={!isEditing}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Status do cliente"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            </div>
          </fieldset>

          {/* Custom Fields */}
          <ContactCustomFields 
            contactId={contactId}
            workspaceId={workspaceId}
            disabled={!isEditing}
          />

          {/* Address Info */}
          <fieldset className="space-y-4 border-0">
            <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Endereço</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <FormField
                  label="CEP"
                  name="cep"
                  type="text"
                  value={formData.cep}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  error={errors.cep}
                />
                {isEditing && formData.cep && (
                  <div className="mt-2">
                    <ContactCEPLookup 
                      cep={formData.cep}
                      disabled={!isEditing}
                      onAddressFound={(address) => {
                        Object.entries(address).forEach(([key, value]) => {
                          onInputChange({ target: { name: key, value } });
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <FormField
                label="Rua"
                name="endereco"
                type="text"
                value={formData.endereco}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="Preenchido automaticamente ao buscar CEP"
              />
              <FormField
                label="Número"
                name="numero"
                type="text"
                value={formData.numero}
                onChange={onInputChange}
                disabled={!isEditing}
              />
              <FormField
                label="Complemento"
                name="complemento"
                type="text"
                value={formData.complemento}
                onChange={onInputChange}
                disabled={!isEditing}
              />
              <FormField
                label="Bairro"
                name="bairro"
                type="text"
                value={formData.bairro}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="Preenchido automaticamente ao buscar CEP"
              />
              <FormField
                label="Cidade"
                name="cidade"
                type="text"
                value={formData.cidade}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="Preenchido automaticamente ao buscar CEP"
              />
              <FormField
                label="UF"
                name="uf"
                type="text"
                value={formData.uf}
                onChange={onInputChange}
                disabled={!isEditing}
                maxLength="2"
                placeholder="Preenchido automaticamente ao buscar CEP"
              />
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="pt-6 sm:pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 sm:space-y-0 sm:flex sm:gap-3">
            {isEditing && (
              <>
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                >
                  <Save className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  onClick={onCancel} 
                  variant="outline"
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <X className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                  Cancelar
                </Button>
              </>
            )}
            {!isEditing && contactId !== 'new' && onDelete && (
              <ContactDeleteButton 
                contactId={contactId}
                contactCreatedBy={contact?.created_by}
                onSuccess={onDelete}
              />
            )}
          </div>

          {/* Metadata - only when not editing */}
          {!isEditing && contactId !== 'new' && (
            <ContactMetadata contact={contact} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}