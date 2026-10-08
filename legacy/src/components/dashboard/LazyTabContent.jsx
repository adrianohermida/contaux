import React from 'react';

/**
 * LazyTabContent - Renderiza conteúdo da aba sob demanda
 * Melhora performance ao não renderizar abas invisíveis
 */
export default function LazyTabContent({ value, activeTab, children, loading = false }) {
  // Só renderiza quando a aba está ativa
  if (activeTab !== value) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}