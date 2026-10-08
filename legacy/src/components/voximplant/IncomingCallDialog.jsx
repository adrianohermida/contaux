/**
 * Dialog para chamadas recebidas
 * Notifica usuário e oferece opções
 */

import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function IncomingCallDialog({ call, onAccept, onReject }) {
  const [isRinging, setIsRinging] = useState(true);

  // Efeito de toque pulsante
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRinging(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!call) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Animated Background */}
        <div className={`bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center transition-opacity ${isRinging ? 'opacity-100' : 'opacity-80'}`}>
          <div className="text-white mb-4">
            <h2 className="text-2xl font-bold mb-2">Chamada Recebida</h2>
            <p className="text-lg opacity-90">{call.displayName || call.from}</p>
            <p className="text-sm opacity-75 mt-1">
              {call.type === 'video' ? '📹 Chamada em Vídeo' : '📞 Chamada de Voz'}
            </p>
          </div>

          {/* Ringing Animation */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 bg-white rounded-full transition-all ${
                  isRinging ? 'scale-100 opacity-100' : 'scale-50 opacity-50'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-4">
          {/* Reject Button */}
          <button
            onClick={() => onReject()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            Rejeitar
          </button>

          {/* Accept Button (Voice) */}
          <button
            onClick={() => onAccept({ video: false })}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Phone className="w-5 h-5" />
            Aceitar
          </button>

          {/* Accept with Video Button (if incoming call supports video) */}
          {call.type === 'video' && (
            <button
              onClick={() => onAccept({ video: true })}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Video className="w-5 h-5" />
              Vídeo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}