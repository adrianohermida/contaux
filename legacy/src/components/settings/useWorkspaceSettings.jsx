/**
 * useWorkspaceSettings Hook
 * Centralized hook for workspace branding & settings
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useWorkspaceSettings(workspaceId) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['workspace-settings', workspaceId],
    queryFn: async () => {
      const results = await base44.entities.WorkspaceSettings.filter({ workspace_id: workspaceId });
      return results[0] || null;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  // Apply brand colors to CSS variables
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    if (settings.primary_color) {
      // Convert hex to HSL for CSS variable compatibility
      root.style.setProperty('--brand-primary', settings.primary_color);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--brand-secondary', settings.secondary_color);
    }
    if (settings.accent_color) {
      root.style.setProperty('--brand-accent', settings.accent_color);
    }
    if (settings.brand_name) {
      document.title = settings.brand_name;
    }
    if (settings.favicon_url) {
      const link = document.querySelector("link[rel~='icon']");
      if (link) link.href = settings.favicon_url;
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings?.id) {
        return base44.entities.WorkspaceSettings.update(settings.id, data);
      }
      return base44.entities.WorkspaceSettings.create({ workspace_id: workspaceId, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-settings', workspaceId] });
    },
  });

  return {
    settings,
    isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saved: saveMutation.isSuccess,
  };
}