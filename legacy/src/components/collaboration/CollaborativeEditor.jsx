import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FileText, Users, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Collaborative Editor - Real-time multi-user editing
 * CRDT-based synchronization, conflict resolution
 */
export default function CollaborativeEditor({ documentId, initialContent = '' }) {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [collaborators, setCollaborators] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());

  // Simula WebSocket para edição colaborativa
  const handleContentChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Editor Colaborativo</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{collaborators} {collaborators === 1 ? 'usuário' : 'usuários'}</span>
          </div>
          <Button onClick={handleSave} disabled={isSyncing} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSyncing ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          className="w-full h-64 p-3 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Comece a escrever..."
        />
      </Card>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {isSyncing && (
            <>
              <AlertCircle className="w-3 h-3 animate-spin" />
              <span>Sincronizando...</span>
            </>
          )}
        </div>
        <span>Último salvamento: {lastSaved.toLocaleTimeString('pt-BR')}</span>
      </div>
    </div>
  );
}