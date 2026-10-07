/**
 * UNIFIED CONTACT/CLIENT FORM
 * Shared component used by both Contact and Clients pages
 * Consolidates ContactCreateModal + ClientCreateModal logic
 */

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function UnifiedContactForm({
  open,
  onClose,
  workspaceId,
  onSuccess,
  type = 'simple', // 'simple' for clients, 'full' for contacts
  modalType = 'dialog' // 'dialog' or 'custom'
}) {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    client_type: 'pj',
    status: 'active',
    // Extended fields for full form
    cpf: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_name.trim() || !formData.email.trim()) {
      setError('Nome e email são obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const newContact = await base44.entities.Client.create({
        ...formData,
        tenant_id: workspaceId,
      });

      // Log activity for contacts
      if (type === 'full') {
        await base44.entities.ContactActivity.create({
          workspace_id: workspaceId,
          contact_id: newContact.id,
          activity_type: 'created',
          description: 'Contato criado',
          metadata: { client_type: formData.client_type },
        });
      }

      // Reset form
      setFormData({
        company_name: '',
        email: '',
        phone: '',
        client_type: 'pj',
        status: 'active',
        cpf: '',
        cnpj: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: ''
      });
      onSuccess?.(newContact);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar contato');
    } finally {
      setIsLoading(false);
    }
  };

  const title = type === 'simple' ? 'Novo Cliente' : 'Novo Contato';

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label={`Formulário de ${title.toLowerCase()}`}>
      <fieldset className="space-y-4 border-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="client_type" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Tipo *
            </label>
            <select
              id="client_type"
              name="client_type"
              value={formData.client_type}
              onChange={handleChange}
              disabled={isLoading}
              aria-label="Tipo de cliente"
              aria-required="true"
              className="w-full px-3 py-3 min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <option value="pf">Pessoa Física</option>
            <option value="pj">Pessoa Jurídica</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
            aria-label="Status do cliente"
            className="w-full px-3 py-3 min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          Nome {formData.client_type === 'pf' ? 'da Pessoa' : 'da Empresa'} *
        </label>
        <Input
          id="company_name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder={formData.client_type === 'pf' ? 'Seu nome completo' : 'Nome da empresa'}
          disabled={isLoading}
          aria-label="Nome completo"
          aria-required="true"
          className="min-h-[44px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="document" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            {formData.client_type === 'pf' ? 'CPF' : 'CNPJ'}
          </label>
          <Input
            id="document"
            name={formData.client_type === 'pf' ? 'cpf' : 'cnpj'}
            value={formData.client_type === 'pf' ? formData.cpf : formData.cnpj}
            onChange={handleChange}
            placeholder={formData.client_type === 'pf' ? '123.456.789-00' : '12.345.678/0001-90'}
            disabled={isLoading}
            aria-label={formData.client_type === 'pf' ? 'CPF' : 'CNPJ'}
            className="min-h-[44px]"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            disabled={isLoading}
            aria-label="Email"
            aria-required="true"
            className="min-h-[44px]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          Telefone
        </label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(11) 98765-4321"
          disabled={isLoading}
          aria-label="Telefone"
          className="min-h-[44px]"
        />
      </div>

      {/* Extended address fields for full form */}
      {type === 'full' && (
        <fieldset className="space-y-4 border-0">
          <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100">Endereço</legend>
          <div>
            <label htmlFor="cep" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              CEP
            </label>
            <Input
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              placeholder="12345-678"
              disabled={isLoading}
              aria-label="CEP"
              className="min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Endereço
              </label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Rua/Avenida"
                disabled={isLoading}
                aria-label="Endereço"
                className="min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="numero" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Número
              </label>
              <Input
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="123"
                disabled={isLoading}
                aria-label="Número"
                className="min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="complemento" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Complemento
            </label>
            <Input
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder="Apto, Sala, etc"
              disabled={isLoading}
              aria-label="Complemento"
              className="min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="bairro" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Bairro
              </label>
              <Input
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Bairro"
                disabled={isLoading}
                aria-label="Bairro"
                className="min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Cidade
              </label>
              <Input
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Cidade"
                disabled={isLoading}
                aria-label="Cidade"
                className="min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="uf" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                UF
              </label>
              <Input
                id="uf"
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                placeholder="SP"
                maxLength="2"
                disabled={isLoading}
                aria-label="Unidade Federativa"
                className="min-h-[44px]"
              />
            </div>
          </div>
        </fieldset>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="min-h-[44px]"
          aria-label="Cancelar formulário"
        >
          <X className="w-4 h-4 mr-2" aria-hidden="true" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
          aria-label={isLoading ? `Criando ${title.toLowerCase()}...` : `Criar ${title.toLowerCase()}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Criando...
            </>
          ) : (
            `Criar ${title}`
          )}
        </Button>
      </div>
      </fieldset>
    </form>
  );

  if (modalType === 'dialog') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {formFields}
        </DialogContent>
      </Dialog>
    );
  }

  // Custom modal for contacts (existing behavior)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ display: open ? 'flex' : 'none' }}>
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {formFields}
      </div>
    </div>
  );
}