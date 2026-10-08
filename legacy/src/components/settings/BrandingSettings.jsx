/**
 * Branding Settings
 * Logo upload + brand name + colors customization
 */

import React, { useState, useEffect } from 'react';
import { Upload, Loader2, Save, RefreshCw, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspaceSettings } from './useWorkspaceSettings';
import { base44 } from '@/api/base44Client';

const PRESET_COLORS = [
  { name: 'Azul (Padrão)', primary: '#3b82f6', secondary: '#6366f1', accent: '#10b981' },
  { name: 'Verde', primary: '#10b981', secondary: '#059669', accent: '#3b82f6' },
  { name: 'Roxo', primary: '#8b5cf6', secondary: '#6d28d9', accent: '#ec4899' },
  { name: 'Laranja', primary: '#f59e0b', secondary: '#d97706', accent: '#ef4444' },
  { name: 'Rosa', primary: '#ec4899', secondary: '#db2777', accent: '#8b5cf6' },
  { name: 'Slate (Neutro)', primary: '#64748b', secondary: '#475569', accent: '#3b82f6' },
];

export default function BrandingSettings({ workspaceId }) {
  const { settings, isLoading, save, isSaving, saved } = useWorkspaceSettings(workspaceId);
  const [form, setForm] = useState({
    brand_name: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#6366f1',
    accent_color: '#10b981',
    dark_mode_default: false,
    date_format: 'DD/MM/YYYY',
    currency: 'BRL',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        primary_color: settings.primary_color || '#3b82f6',
        secondary_color: settings.secondary_color || '#6366f1',
        accent_color: settings.accent_color || '#10b981',
        dark_mode_default: settings.dark_mode_default || false,
        date_format: settings.date_format || 'DD/MM/YYYY',
        currency: settings.currency || 'BRL',
      });
    }
  }, [settings]);

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, logo_url: file_url }));
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, favicon_url: file_url }));
    } catch (err) {
      console.error('Favicon upload error:', err);
    } finally {
      setUploadingFavicon(false);
    }
  };

  const applyPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    }));
  };

  const handleSave = () => {
    save(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Identity */}
      <section aria-labelledby="identity-heading">
        <h3 id="identity-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Identidade da Marca
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand-name">Nome da Marca</Label>
            <Input
              id="brand-name"
              placeholder="Ex: Minha Empresa CRM"
              value={form.brand_name}
              onChange={(e) => setForm(prev => ({ ...prev, brand_name: e.target.value }))}
              className="mt-1 min-h-[44px]"
            />
          </div>
          <div>
            <Label htmlFor="currency">Moeda Padrão</Label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
              className="mt-1 flex h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="BRL">BRL - Real Brasileiro</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </section>

      {/* Logo & Favicon */}
      <section aria-labelledby="logo-heading">
        <h3 id="logo-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Logo & Favicon
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <Label>Logo Principal</Label>
            <div className="mt-2 flex items-center gap-3">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo da marca"
                  className="h-12 w-auto max-w-[120px] object-contain rounded border border-slate-200 dark:border-slate-700 bg-white p-1"
                />
              ) : (
                <div className="h-12 w-24 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded border border-dashed border-slate-300 dark:border-slate-600">
                  <Image className="w-5 h-5 text-slate-400" aria-hidden="true" />
                </div>
              )}
              <div>
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="w-4 h-4" aria-hidden="true" />
                  )}
                  {uploadingLogo ? 'Enviando...' : 'Upload Logo'}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleUploadLogo}
                  aria-label="Upload de logo"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, SVG, JPG (max 2MB)</p>
              </div>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <Label>Favicon</Label>
            <div className="mt-2 flex items-center gap-3">
              {form.favicon_url ? (
                <img
                  src={form.favicon_url}
                  alt="Favicon"
                  className="h-8 w-8 object-contain rounded border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="h-8 w-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded border border-dashed border-slate-300 dark:border-slate-600">
                  <Image className="w-4 h-4 text-slate-400" aria-hidden="true" />
                </div>
              )}
              <div>
                <label
                  htmlFor="favicon-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
                >
                  {uploadingFavicon ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="w-4 h-4" aria-hidden="true" />
                  )}
                  {uploadingFavicon ? 'Enviando...' : 'Upload Favicon'}
                </label>
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleUploadFavicon}
                  aria-label="Upload de favicon"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ICO, PNG 32x32</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Colors */}
      <section aria-labelledby="colors-heading">
        <h3 id="colors-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Cores da Marca
        </h3>

        {/* Preset palettes */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Paletas predefinidas</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                title={preset.name}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all min-h-[40px]"
                aria-label={`Aplicar paleta ${preset.name}`}
              >
                <span className="flex gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: preset.primary }} />
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: preset.secondary }} />
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: preset.accent }} />
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom color pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'primary_color', label: 'Cor Primária' },
            { key: 'secondary_color', label: 'Cor Secundária' },
            { key: 'accent_color', label: 'Cor de Destaque' },
          ].map(({ key, label }) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id={key}
                  type="color"
                  value={form[key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="h-10 w-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5"
                  aria-label={label}
                />
                <Input
                  value={form[key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 font-mono text-sm min-h-[40px]"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live Preview */}
        <div className="mt-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Pré-visualização</p>
          <div className="flex flex-wrap gap-2">
            <button
              style={{ background: form.primary_color }}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              aria-label="Pré-visualização da cor primária"
            >
              Botão Primário
            </button>
            <button
              style={{ background: form.secondary_color }}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              aria-label="Pré-visualização da cor secundária"
            >
              Botão Secundário
            </button>
            <span
              style={{ background: form.accent_color + '20', color: form.accent_color, border: `1px solid ${form.accent_color}40` }}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
            >
              Badge Destaque
            </span>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 min-h-[44px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Salvar Configurações de Marca
            </>
          )}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ Salvo com sucesso!
          </span>
        )}
        <Button
          onClick={() => {
            if (settings) {
              setForm({
                brand_name: settings.brand_name || '',
                logo_url: settings.logo_url || '',
                primary_color: settings.primary_color || '#3b82f6',
                secondary_color: settings.secondary_color || '#6366f1',
                accent_color: settings.accent_color || '#10b981',
                currency: settings.currency || 'BRL',
                date_format: settings.date_format || 'DD/MM/YYYY',
              });
            }
          }}
          variant="ghost"
          className="gap-2 text-slate-500 hover:text-slate-700 min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Resetar
        </Button>
      </div>
    </div>
  );
}