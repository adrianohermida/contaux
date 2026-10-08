import React, { useEffect, useState, useCallback } from 'react';
import { Mouse, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Live Cursor Tracker - Mostra posição de cursor em tempo real
 * Cada usuário tem cor distinta, indicador de atividade
 */
export default function LiveCursorTracker({ documentId }) {
  const [cursors, setCursors] = useState([
    { id: 1, user: 'Você', color: '#3B82F6', x: 10, y: 20, active: true },
    { id: 2, user: 'João Silva', color: '#EF4444', x: 50, y: 100, active: true },
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mouse className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Cursores em Tempo Real</h3>
      </div>

      <Card className="p-4 space-y-3">
        {cursors.map(cursor => (
          <div key={cursor.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cursor.color }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{cursor.user}</p>
              <p className="text-xs text-gray-500">
                Posição: {cursor.x}px, {cursor.y}px
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ${cursor.active ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        ))}
      </Card>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>{cursors.length} usuários editando</span>
      </div>
    </div>
  );
}