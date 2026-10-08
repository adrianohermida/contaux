import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContactModal from './ContactModal';
import { base44 } from '@/api/base44Client';

export default function ContactCreateModal({ open, onClose, workspaceId, onSuccess }) {
  const [formData, setFormData] = useState({
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

      await base44.entities.ContactActivity.create({
        workspace_id: workspaceId,
        contact_id: newContact.id,
        activity_type: 'created',
        description: 'Contato criado',
        metadata: { client_type: formData.client_type },
      });

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

  return (
    <ContactModal open={open} onClose={onClose} title="Novo Contato">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Tipo *
            </label>
            <select
              name="client_type"
              value={formData.client_type}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="pf">Pessoa Física</option>
              <option value="pj">Pessoa Jurídica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Nome {formData.client_type === 'pf' ? 'da Pessoa' : 'da Empresa'} *
          </label>
          <Input
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder={formData.client_type === 'pf' ? 'Seu nome completo' : 'Nome da empresa'}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              {formData.client_type === 'pf' ? 'CPF' : 'CNPJ'}
            </label>
            <Input
              name={formData.client_type === 'pf' ? 'cpf' : 'cnpj'}
              value={formData.client_type === 'pf' ? formData.cpf : formData.cnpj}
              onChange={handleChange}
              placeholder={formData.client_type === 'pf' ? '123.456.789-00' : '12.345.678/0001-90'}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Email *
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Telefone
          </label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 98765-4321"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            CEP
          </label>
          <Input
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            placeholder="12345-678"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Endereço
            </label>
            <Input
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Rua/Avenida"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Número
            </label>
            <Input
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="123"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            Complemento
          </label>
          <Input
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            placeholder="Apto, Sala, etc"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Bairro
            </label>
            <Input
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Bairro"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Cidade
            </label>
            <Input
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Cidade"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              UF
            </label>
            <Input
              name="uf"
              value={formData.uf}
              onChange={handleChange}
              placeholder="SP"
              maxLength="2"
              disabled={isLoading}
            />
          </div>
        </div>

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
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Contato'
            )}
          </Button>
        </div>
      </form>
    </ContactModal>
  );
}