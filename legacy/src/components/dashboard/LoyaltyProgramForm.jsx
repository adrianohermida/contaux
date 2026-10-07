import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';

const VALIDATION_RULES = {
  name: { required: true, minLength: 3, label: 'Program Name' },
  points_per_dollar: { required: true, label: 'Points per Dollar' },
};

export default function LoyaltyProgramForm({ program, workspaceId, isOpen, onCancel, onSubmit }) {
  const [showTierForm, setShowTierForm] = useState(false);
  const [tierInput, setTierInput] = useState({ name: '', min_points: '', benefits: '' });
  const queryClient = useQueryClient();
  const { errors, validateForm, setFieldError } = useFormValidation();

  const { formData, setFieldValue, reset, isDirty } = useFormState(
    program || {
      name: '',
      description: '',
      points_per_dollar: 1,
      redemption_rate: 1,
      tier_system: false,
      tiers: [],
      status: 'active',
      launch_date: new Date().toISOString().split('T')[0],
    }
  );

  const mutation = useMutation({
    mutationFn: (data) => {
      if (program?.id) {
        return base44.entities.LoyaltyProgram.update(program.id, data);
      }
      return base44.entities.LoyaltyProgram.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyPrograms'] });
      reset();
      if (onSubmit) onSubmit();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm(formData, VALIDATION_RULES)) return;

    mutation.mutate({
      workspace_id: workspaceId,
      ...formData,
    });
  };

  const addTier = () => {
    if (!tierInput.name || !tierInput.min_points) {
      setFieldError('tier', 'Tier name and min points required');
      return;
    }

    const newTier = {
      name: tierInput.name,
      min_points: parseInt(tierInput.min_points),
      benefits: tierInput.benefits.split(',').map(b => b.trim()).filter(Boolean),
      bonus_multiplier: 1,
    };

    setFieldValue('tiers', [...formData.tiers, newTier]);
    setTierInput({ name: '', min_points: '', benefits: '' });
    setShowTierForm(false);
  };

  const removeTier = (index) => {
    setFieldValue('tiers', formData.tiers.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {program ? 'Editar Programa' : 'Novo Programa de Fidelização'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Nome do Programa *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFieldValue('name', e.target.value)}
                placeholder="ex: Gold Rewards"
                className="dark:bg-slate-800 dark:text-white"
                aria-label="Program name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFieldValue('description', e.target.value)}
                placeholder="Descreva o programa de fidelização..."
                className="dark:bg-slate-800 dark:text-white"
                aria-label="Program description"
              />
            </div>
          </div>

          {/* Points Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Pontos por Dollar *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.points_per_dollar}
                onChange={(e) => setFieldValue('points_per_dollar', parseFloat(e.target.value))}
                className="dark:bg-slate-800 dark:text-white"
                aria-label="Points per dollar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Valor de Resgate (por 100 pts)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.redemption_rate}
                onChange={(e) => setFieldValue('redemption_rate', parseFloat(e.target.value))}
                className="dark:bg-slate-800 dark:text-white"
                aria-label="Redemption rate"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Status
            </label>
            <Select value={formData.status} onValueChange={(value) => setFieldValue('status', value)}>
              <SelectTrigger className="dark:bg-slate-800 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tier System */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Sistema de Tiers
              </label>
              <Switch
                checked={formData.tier_system}
                onCheckedChange={(checked) => setFieldValue('tier_system', checked)}
                aria-label="Enable tier system"
              />
            </div>

            {formData.tier_system && (
              <div className="space-y-3 border dark:border-slate-700 rounded p-4">
                {formData.tiers.length > 0 && (
                  <div className="space-y-2">
                    {formData.tiers.map((tier, idx) => (
                      <div key={idx} className="flex justify-between items-start bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{tier.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            A partir de {tier.min_points} pontos
                          </p>
                          {tier.benefits.length > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {tier.benefits.join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTier(idx)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remove tier ${tier.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!showTierForm ? (
                  <button
                    type="button"
                    onClick={() => setShowTierForm(true)}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Tier
                  </button>
                ) : (
                  <div className="space-y-3 bg-blue-50 dark:bg-slate-700 p-3 rounded">
                    <Input
                      placeholder="Nome (ex: Gold)"
                      value={tierInput.name}
                      onChange={(e) => setTierInput({ ...tierInput, name: e.target.value })}
                      className="dark:bg-slate-800 dark:text-white"
                      aria-label="Tier name"
                    />
                    <Input
                      type="number"
                      placeholder="Pontos mínimos"
                      value={tierInput.min_points}
                      onChange={(e) => setTierInput({ ...tierInput, min_points: e.target.value })}
                      className="dark:bg-slate-800 dark:text-white"
                      aria-label="Minimum points"
                    />
                    <Input
                      placeholder="Benefícios (separados por vírgula)"
                      value={tierInput.benefits}
                      onChange={(e) => setTierInput({ ...tierInput, benefits: e.target.value })}
                      className="dark:bg-slate-800 dark:text-white"
                      aria-label="Tier benefits"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={addTier}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Adicionar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowTierForm(false)}
                        size="sm"
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Launch Date */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Data de Lançamento
            </label>
            <Input
              type="date"
              value={formData.launch_date}
              onChange={(e) => setFieldValue('launch_date', e.target.value)}
              className="dark:bg-slate-800 dark:text-white"
              aria-label="Launch date"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t dark:border-slate-700 pt-6">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}