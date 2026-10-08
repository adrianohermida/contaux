/**
 * Hook useCollection — carrega dados da API e provê operações CRUD
 */
import { useState, useEffect, useCallback } from 'react';
import { createApiClient } from '@/lib/api';

export function useCollection(resource) {
  const api = createApiClient(resource);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Recarrega quando o usuário clica "Atualizar" no Header
  useEffect(() => {
    const handler = () => reload();
    window.addEventListener('app-refresh', handler);
    return () => window.removeEventListener('app-refresh', handler);
  }, [reload]);

  const create = useCallback(async (data) => {
    const created = await api.create(data);
    setItems((prev) => [created, ...prev]);
    return created;
  }, [resource]);

  const update = useCallback(async (id, data) => {
    const updated = await api.update(id, data);
    setItems((prev) => prev.map((it) => (String(it.id) === String(id) ? updated : it)));
    return updated;
  }, [resource]);

  const remove = useCallback(async (id) => {
    await api.remove(id);
    setItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
  }, [resource]);

  return { items, loading, error, reload, create, update, remove };
}
