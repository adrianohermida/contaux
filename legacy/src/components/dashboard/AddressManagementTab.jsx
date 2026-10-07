import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AddressManagementTab({ clientId, tenantId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    address_type: 'headquarters',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    is_primary: false
  });

  useEffect(() => {
    loadAddresses();
  }, [clientId, tenantId]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.CompanyAddress.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setAddresses(data);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cep || !formData.endereco || !formData.numero) {
      toast.error('Preencha os campos obrigatórios');
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
        await base44.entities.CompanyAddress.update(editingId, data);
        toast.success('Endereço atualizado com sucesso!');
      } else {
        await base44.entities.CompanyAddress.create(data);
        toast.success('Endereço adicionado com sucesso!');
      }

      resetForm();
      await loadAddresses();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      toast.error('Erro ao salvar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão deste endereço?')) return;

    try {
      setLoading(true);
      await base44.entities.CompanyAddress.delete(id);
      toast.success('Endereço removido');
      await loadAddresses();
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      toast.error('Erro ao deletar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
  };

  const resetForm = () => {
    setFormData({
      address_type: 'headquarters',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      is_primary: false
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Endereço</label>
            <select
              value={formData.address_type}
              onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="headquarters">Matriz</option>
              <option value="branch">Filial</option>
              <option value="regional">Regional</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CEP</label>
            <input
              type="text"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              placeholder="XXXXX-XXX"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rua/Avenida</label>
          <input
            type="text"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Número</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Complemento</label>
            <input
              type="text"
              value={formData.complemento}
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              placeholder="Apt, sala..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bairro</label>
            <input
              type="text"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <input
              type="text"
              value={formData.uf}
              onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
              placeholder="SP, RJ, MG..."
              maxLength="2"
              className="w-full px-3 py-2 border rounded-lg uppercase"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Endereço principal</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingId ? 'Atualizar' : 'Adicionar'} Endereço
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
        <h3 className="text-lg font-semibold">Endereços Cadastrados</h3>
        {loading && !addresses.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhum endereço cadastrado
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{addr.endereco}, {addr.numero}</span>
                  {addr.is_primary && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Principal</span>}
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded capitalize">
                    {addr.address_type === 'headquarters' ? 'Matriz' : addr.address_type === 'branch' ? 'Filial' : addr.address_type === 'regional' ? 'Regional' : 'Outro'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {addr.complemento && `${addr.complemento}, `}{addr.bairro} - {addr.cidade}, {addr.uf}
                </p>
                <p className="text-xs text-slate-500 mt-1">{addr.cep}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(addr)}
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(addr.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}