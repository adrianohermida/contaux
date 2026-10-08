import React, { useState } from 'react';
import { VoxImplantProvider } from './voximplant/context';
import { useVoxImplant } from './hooks/useVoxImplant';
import LoginForm from './voximplant/LoginForm';
import CallUI from './voximplant/CallUI';
import ChatUI from './voximplant/ChatUI';
import IncomingCallDialog from './voximplant/IncomingCallDialog';
import ConferenceUI from './voximplant/ConferenceUI';
import { LogOut } from 'lucide-react';

function CommunicationCenterContent() {
  const { isAuthenticated, logout, currentUser, notification, incomingCall, acceptIncomingCall, rejectIncomingCall, activeConference } = useVoxImplant();
  const [selectedChatContact, setSelectedChatContact] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Central de Comunicação VoIP</h2>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Central de Comunicação</h2>
            <p className="text-sm text-slate-600">Conectado: {currentUser?.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Desconectar
          </button>
        </div>

        {/* Call UI */}
        <CallUI />
      </div>

      {/* Chat UI */}
      {selectedChatContact && (
        <ChatUI
          contact={selectedChatContact}
          onClose={() => setSelectedChatContact(null)}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 left-4 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 z-50 ${
          notification.type === 'error' ? 'bg-red-500' :
          notification.type === 'success' ? 'bg-green-500' :
          'bg-blue-500'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Conference UI */}
      {activeConference && (
        <ConferenceUI onClose={() => {}} />
      )}

      {/* Incoming Call Dialog */}
      {incomingCall && (
        <IncomingCallDialog
          call={incomingCall}
          onAccept={acceptIncomingCall}
          onReject={rejectIncomingCall}
        />
      )}
    </div>
  );
}

export default function CommunicationCenter() {
  return (
    <VoxImplantProvider>
      <CommunicationCenterContent />
    </VoxImplantProvider>
  );
}