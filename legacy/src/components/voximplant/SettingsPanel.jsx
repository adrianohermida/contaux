import React, { useState, useEffect } from 'react';
import { X, Mic, Volume2, Video, Save } from 'lucide-react';
import { useVoxImplant } from '../hooks/useVoxImplant';

export default function SettingsPanel({ onClose }) {
  const {
    audioDevices,
    videoDevices,
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,
  } = useVoxImplant();

  const [localSettings, setLocalSettings] = useState({
    audioInput: selectedAudioInput,
    audioOutput: selectedAudioOutput,
    videoInput: selectedVideoInput,
  });

  const handleSave = () => {
    setSelectedAudioInput(localSettings.audioInput);
    setSelectedAudioOutput(localSettings.audioOutput);
    setSelectedVideoInput(localSettings.videoInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Configurações de Áudio e Vídeo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Audio Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
              <Mic className="w-4 h-4" />
              Microfone
            </label>
            <select
              value={localSettings.audioInput || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, audioInput: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            >
              <option value="">Selecione um microfone</option>
              {audioDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Microfone ${device.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Output */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
              <Volume2 className="w-4 h-4" />
              Alto-falante
            </label>
            <select
              value={localSettings.audioOutput || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, audioOutput: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            >
              <option value="">Selecione um alto-falante</option>
              {audioDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Alto-falante ${device.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Video Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
              <Video className="w-4 h-4" />
              Câmera
            </label>
            <select
              value={localSettings.videoInput || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, videoInput: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            >
              <option value="">Selecione uma câmera</option>
              {videoDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Câmera ${device.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}