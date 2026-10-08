/**
 * Hook useTheme — carrega, persiste e aplica as configurações de branding.
 *
 * - Lê do localStorage imediatamente (evita flash de cor ao recarregar)
 * - Busca do backend na montagem e sincroniza
 * - Aplica a cadência de cores via applyBrandTheme() sempre que a cor muda
 * - save() persiste no backend e atualiza o cache local
 */
import { useState, useEffect, useCallback } from 'react';
import { applyBrandTheme } from '@/lib/theme';
import { request } from '@/lib/api';

const STORAGE_KEY = 'contaux-settings';

const DEFAULT_SETTINGS = {
  name: 'Contaux Contadoria',
  primary_color: '#3763EB',
  timezone: 'America/Manaus',
  locale: 'pt-BR',
};

function readCached() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  } catch { /* ignora */ }
  return DEFAULT_SETTINGS;
}

export function useTheme() {
  const [settings, setSettings] = useState(readCached);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Aplica a cadência de cores sempre que a cor primária muda
  useEffect(() => {
    applyBrandTheme(settings.primary_color);
  }, [settings.primary_color]);

  // Carrega do backend
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request('/settings');
      const merged = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Persiste no backend
  const save = useCallback(async (newSettings) => {
    setSaving(true);
    setError(null);
    try {
      const data = await request('/settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings),
      });
      const merged = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, setSettings, loading, saving, error, save, reload };
}
