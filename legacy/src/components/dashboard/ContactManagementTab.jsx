import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ContactManagementTab({ clientId, tenantId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    role: 'contact',
    can_sign: false,
    receives_notifications: true
  });

  const roles = [
    { value: 'director', label: 'Diretor' },
    { value: 'manager', label: 'Gerente' },
    { value: 'accountant', label: 'Contabilista' },
    { value: 'contact', label: 'Contato' },
    { value: 'representative', label: 'Representante' }
  ];

  useEffect(() => {
    loadContacts();
  }, [clientId, tenantId]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.CompanyContact.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setContacts(data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.contact_name || !formData.contact_email) {
      toast.error('Preencha nome e email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast.error('Email inválido');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        tenant_id: tenantId,
        client_id: clientId
      };

      if (editingId) {
        await base44.entities.CompanyContact.update(editingId, data);
        toast.success('Contato atualizado com sucesso!');
      } else {
        await base44.entities.CompanyContact.create(data);
        toast.success('Contato adicionado com sucesso!');
      }

      resetForm();
      await loadContacts();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      toast.error('Erro ao salvar contato');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão deste contato?')) return;

    try {
      setLoading(true);
      await base44.entities.CompanyContact.delete(id);
      toast.success('Contato removido');
      await loadContacts();
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      toast.error('Erro ao deletar contato');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      contact_name: contact.contact_name,
      contact_email: contact.contact_email,
      contact_phone: contact.contact_phone,
      role: contact.role,
      can_sign: contact.can_sign,
      receives_notifications: contact.receives_notifications
    });
    setEditingId(contact.id);
  };

  const resetForm = () => {
    setFormData({
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      role: 'contact',
      can_sign: false,
      receives_notifications: true
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cargo</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.can_sign}
              onChange={(e) => setFormData({ ...formData, can_sign: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Pode assinar documentos</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.receives_notifications}
              onChange={(e) => setFormData({ ...formData, receives_notifications: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Recebe notificações</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingId ? 'Atualizar' : 'Adicionar'} Contato
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Contatos Cadastrados</h3>
        {loading && !contacts.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhum contato cadastrado
          </div>
        ) : (
          contacts.map((contact) => {
            const roleName = roles.find(r => r.value === contact.role)?.label || contact.role;
            return (
              <div key={contact.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{contact.contact_name}</span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{roleName}</span>
                    {contact.can_sign && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Pode Assinar</span>}
                  </div>
                  <p className="text-sm text-slate-600">{contact.contact_email}</p>
                  {contact.contact_phone && <p className="text-sm text-slate-600">{contact.contact_phone}</p>}
                  <p className="text-xs text-slate-500 mt-1">
                    {contact.receives_notifications ? '✓ Recebe notificações' : '✗ Não recebe notificações'}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(contact)}
                    disabled={loading}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(contact.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}