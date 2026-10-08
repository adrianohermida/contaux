import React, { useState } from 'react';
import { X, Plus, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import { useVoxImplant } from '../hooks/useVoxImplant';

export default function ConferenceUI({ onClose }) {
  const { activeConference, participants, leaveConference, toggleAudio, toggleVideo } = useVoxImplant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  if (!activeConference) return null;

  const handleLeave = () => {
    leaveConference();
    onClose();
  };

  const handleToggleMic = () => {
    toggleAudio(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-semibold">Conferência</h3>
            <p className="text-xs text-slate-400">{participants.length} participantes</p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Participants Grid */}
      <div className="flex-1 bg-slate-900 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {participants.map((participant, idx) => (
            <div key={idx} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{participant.name}</p>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 p-4 flex items-center justify-center gap-4">
        {/* Mute */}
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-all ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-700'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Video */}
        <button
          onClick={handleToggleVideo}
          className={`p-4 rounded-full transition-all ${
            isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-700'
          }`}
        >
          {isVideoOff ? (
            <VideoOff className="w-6 h-6 text-white" />
          ) : (
            <Video className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Leave */}
        <button
          onClick={handleLeave}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
        >
          Sair
        </button>
      </div>
    </div>
  );
}