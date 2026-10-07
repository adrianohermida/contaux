import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { CALL_STATES, CONNECTION_STATES, VOX_EVENTS, VOX_APP_ID } from './config';
import { VoxLogger } from './logger';
import VoxImplantSDK from './VoxImplantSDK';
import { loadVoxImplantSDK } from './VoxImplantLoader';
import { EventHandler } from './EventHandler';
import { PersistenceHandler } from './PersistenceHandler';
import { CallHandler } from './CallHandler';
import { ConferenceHandler } from './ConferenceHandler';
import { IncomingCallHandler } from './IncomingCallHandler';
import { ConnectionHandler } from './ConnectionHandler';
import { PresenceManager } from './PresenceManager';
import { OfflineCache } from './OfflineCache';

      /**
       * Contexto global para Voximplant
 * Gerencia estado de autenticação, chamadas, chat e conference
 */
export const VoxImplantContext = createContext();

const logger = new VoxLogger('VoxImplantContext');

export function VoxImplantProvider({ children }) {
  // SDK
  const sdkRef = useRef(null);
  const eventHandlerRef = useRef(null);
  const callHandlerRef = useRef(null);
  const conferenceHandlerRef = useRef(null);
  const incomingCallHandlerRef = useRef(null);
  const connectionHandlerRef = useRef(null);
  const persistenceHandlerRef = useRef(new PersistenceHandler());
  const presenceManagerRef = useRef(null);
  const offlineCacheRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  
  // Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  
  // Chamadas recebidas
  const [incomingCall, setIncomingCall] = useState(null);

  // Chamadas
  const [activeCall, setActiveCall] = useState(null);
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [callHistory, setCallHistory] = useState([]);

  // Chat
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // Conference
  const [activeConference, setActiveConference] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Hardware
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState(null);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState(null);
  const [selectedVideoInput, setSelectedVideoInput] = useState(null);

  // Media streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Notificações
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  // Presença e Cache Offline
  const [contactsPresence, setContactsPresence] = useState(new Map());

  /**
   * Mostrar notificação
   */
  const showNotification = useCallback((message, type = 'info') => {
    logger.info(`Notificação [${type}]:`, message);
    setNotification({ message, type, id: Math.random() });

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  /**
   * Atualizar estado de conexão
   */
  const updateConnectionState = useCallback((state) => {
    logger.info('Conexão atualizada:', state);
    setConnectionState(state);
    setIsConnected(state === CONNECTION_STATES.CONNECTED);
  }, []);

  /**
   * Login
   */
  const login = useCallback(async (username, password) => {
    try {
      if (!sdkRef.current || !sdkReady) {
        throw new Error('SDK não está pronto');
      }

      logger.info('Iniciando login...');
      updateConnectionState(CONNECTION_STATES.CONNECTING);

      const success = await sdkRef.current.login(username, password);
      
      if (success) {
        setCurrentUser({ username, email: `${username}@${VOX_APP_ID}.voximplant.com` });
        setIsAuthenticated(true);
        updateConnectionState(CONNECTION_STATES.CONNECTED);
        
        // Registrar event listeners após login bem-sucedido
        if (eventHandlerRef.current) {
          eventHandlerRef.current.registerEvents();
        }
        
        logger.success(`Login bem-sucedido: ${username}`);
        return true;
      } else {
        updateConnectionState(CONNECTION_STATES.FAILED);
        logger.error('Login falhou');
        return false;
      }
    } catch (error) {
      logger.error('Erro ao fazer login:', error);
      updateConnectionState(CONNECTION_STATES.FAILED);
      return false;
    }
  }, [sdkReady, updateConnectionState]);

  /**
   * Aceitar chamada recebida
   */
  const acceptIncomingCall = useCallback(async (options = {}) => {
    try {
      if (!incomingCallHandlerRef.current || !incomingCall) {
        throw new Error('Nenhuma chamada recebida');
      }

      const result = await incomingCallHandlerRef.current.acceptCall(options);
      if (result) {
        setActiveCall({ targetUser: incomingCall.from, callType: incomingCall.type, timestamp: new Date() });
        setCallState(CALL_STATES.ACTIVE);
        setIncomingCall(null);
        showNotification('Chamada aceita', 'success');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao aceitar chamada:', error);
      showNotification('Erro ao aceitar chamada', 'error');
      return false;
    }
  }, [incomingCall, showNotification]);

  /**
   * Rejeitar chamada recebida
   */
  const rejectIncomingCall = useCallback(() => {
    try {
      if (!incomingCallHandlerRef.current) {
        throw new Error('Handler de chamadas recebidas não disponível');
      }

      const success = incomingCallHandlerRef.current.rejectCall();
      if (success) {
        setIncomingCall(null);
        showNotification('Chamada rejeitada', 'info');
      }
      return success;
    } catch (error) {
      logger.error('Erro ao rejeitar chamada:', error);
      return false;
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      logger.info('Desconectando...');
      
      if (sdkRef.current) {
        await sdkRef.current.logout();
      }
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveCall(null);
      setIncomingCall(null);
      setCallState(CALL_STATES.IDLE);
      setMessages([]);
      updateConnectionState(CONNECTION_STATES.DISCONNECTED);
      logger.info('Logout bem-sucedido');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
    }
  }, [updateConnectionState]);

  /**
    * Iniciar chamada
    */
  const startCall = useCallback(async (targetUser, callType) => {
    logger.info(`Iniciando chamada ${callType} para ${targetUser}`);
    try {
      // Requisitar acesso a mídia local
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
      setLocalStream(stream);
      setActiveCall({ targetUser, callType, timestamp: new Date() });
      setCallState(CALL_STATES.CONNECTING);
    } catch (error) {
      logger.error('Erro ao acessar mídia:', error);
      setNotification({ message: 'Erro ao acessar câmera/microfone', type: 'error', id: Math.random() });
    }
  }, []);

  /**
     * Finalizar chamada
     */
   const endCall = useCallback(async () => {
     logger.info('Finalizando chamada');
     if (activeCall) {
       const callRecord = {
         ...activeCall,
         timestamp: new Date(),
         endTime: new Date(),
       };

       // Salvar no histórico
       if (persistenceHandlerRef.current) {
         await persistenceHandlerRef.current.saveCallHistory({
           clientId: activeCall.clientId,
           contactName: activeCall.targetUser,
           callType: activeCall.callType,
           status: 'completed',
           startTime: activeCall.timestamp,
           endTime: new Date(),
         });
       }

       setCallHistory(prev => [...prev, callRecord]);
     }

     // Encerrar streams de mídia local
     if (localStream) {
       localStream.getTracks().forEach(track => track.stop());
       setLocalStream(null);
     }
     setActiveCall(null);
     setCallState(CALL_STATES.IDLE);
     setRemoteStream(null);
   }, [activeCall, localStream]);

  /**
   * Enviar mensagem
   */
  const sendMessage = useCallback(async (content, clientId = null, contactName = null) => {
    logger.info('Enviando mensagem:', content);
    const message = {
      id: Math.random().toString(36),
      from: currentUser?.username,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    
    // Persistir mensagem se temos contexto
    if (clientId && contactName && persistenceHandlerRef.current) {
      await persistenceHandlerRef.current.saveChatMessage({
        clientId,
        contactName,
        fromUser: currentUser?.username,
        content,
        messageType: 'text',
      });
    }
    
    return message;
  }, [currentUser]);

  /**
    * Toggle áudio
    */
  const toggleAudio = useCallback((enabled) => {
    logger.info(`Áudio ${enabled ? 'ativado' : 'desativado'}`);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }, [localStream]);

  /**
    * Toggle vídeo
    */
  const toggleVideo = useCallback((enabled) => {
    logger.info(`Vídeo ${enabled ? 'ativado' : 'desativado'}`);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }, [localStream]);

  /**
   * Criar conference
   */
  const createConference = useCallback((roomId, options = {}) => {
    try {
      if (!conferenceHandlerRef.current) {
        conferenceHandlerRef.current = new ConferenceHandler(sdkRef.current);
      }
      const conf = conferenceHandlerRef.current.createConference(roomId, options);
      if (conf) {
        setActiveConference(conf);
      }
      return conf;
    } catch (error) {
      logger.error('Erro ao criar conferência:', error);
      showNotification('Erro ao criar conferência', 'error');
      return null;
    }
  }, []);

  /**
   * Adicionar participante à conference
   */
  const addConferenceParticipant = useCallback((participantId, participantName, options = {}) => {
    try {
      if (!conferenceHandlerRef.current) {
        throw new Error('Conference handler não inicializado');
      }
      const participant = conferenceHandlerRef.current.addParticipant(
        participantId,
        participantName,
        options
      );
      if (participant) {
        const updated = conferenceHandlerRef.current.getConferenceInfo();
        setParticipants(updated.participants);
        setActiveConference(updated);
      }
      return participant;
    } catch (error) {
      logger.error('Erro ao adicionar participante:', error);
      showNotification('Erro ao adicionar participante', 'error');
      return null;
    }
  }, []);

  /**
   * Entrar em conference
   */
  const joinConference = useCallback((roomId) => {
    logger.info(`Entrando em conference: ${roomId}`);
    setActiveConference({ roomId, joinedAt: new Date() });
  }, []);

  /**
   * Sair de conference
   */
  const leaveConference = useCallback(() => {
    logger.info('Saindo de conference');
    if (conferenceHandlerRef.current) {
      conferenceHandlerRef.current.endConference();
    }
    setActiveConference(null);
    setParticipants([]);
  }, []);

  /**
  * Inicializar SDK ao montar
  */
  useEffect(() => {
    const initSDK = async () => {
      try {
        logger.info('Inicializando Voximplant SDK...');
        await loadVoxImplantSDK();
        sdkRef.current = new VoxImplantSDK(VOX_APP_ID);
        const success = await sdkRef.current.init();
        setSdkReady(success);
        if (success) {
          logger.success('SDK pronto para uso');
          
          // Inicializar handlers
          if (!eventHandlerRef.current && sdkRef.current) {
            eventHandlerRef.current = new EventHandler(sdkRef.current, {
              updateConnectionState,
              showNotification: (msg, type) => setNotification({ message: msg, type, id: Math.random() }),
            });
          }
          
          if (!callHandlerRef.current && sdkRef.current) {
            callHandlerRef.current = new CallHandler(
              sdkRef.current,
              (state) => setCallState(state),
              (type, stream) => {
                if (type === 'remote') setRemoteStream(stream);
              }
            );
          }

          if (!conferenceHandlerRef.current && sdkRef.current) {
            conferenceHandlerRef.current = new ConferenceHandler(sdkRef.current);
          }

          if (!incomingCallHandlerRef.current && sdkRef.current) {
            incomingCallHandlerRef.current = new IncomingCallHandler(
              sdkRef.current,
              (callInfo) => {
                setIncomingCall(callInfo);
                showNotification(`Chamada de ${callInfo.displayName}`, 'info');
              },
              (callInfo) => {
                logger.info('Chamada rejeitada:', callInfo);
              }
            );
            incomingCallHandlerRef.current.registerIncomingCallHandler();
          }

          if (!connectionHandlerRef.current && sdkRef.current) {
            connectionHandlerRef.current = new ConnectionHandler(
              sdkRef.current,
              updateConnectionState
            );
            connectionHandlerRef.current.registerConnectionHandlers();
          }

          // Inicializar PresenceManager
          if (!presenceManagerRef.current && sdkRef.current) {
            presenceManagerRef.current = new PresenceManager(sdkRef.current);
            presenceManagerRef.current.init();
            presenceManagerRef.current.subscribe((contactId, status) => {
              setContactsPresence(prev => new Map(prev).set(contactId, status));
            });
          }

          // Inicializar OfflineCache
          if (!offlineCacheRef.current) {
            offlineCacheRef.current = new OfflineCache();
            offlineCacheRef.current.init().catch(err => {
              logger.warn('OfflineCache não disponível:', err);
            });
          }
        }
      } catch (error) {
        logger.error('Erro ao inicializar SDK:', error);
        setSdkReady(false);
      }
    };

    initSDK();

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (callHandlerRef.current) {
        callHandlerRef.current.cleanup();
      }
      if (eventHandlerRef.current) {
        eventHandlerRef.current.cleanup();
      }
      if (incomingCallHandlerRef.current) {
        incomingCallHandlerRef.current.cleanup();
      }
      if (connectionHandlerRef.current) {
        connectionHandlerRef.current.cleanup();
      }
      if (presenceManagerRef.current) {
        presenceManagerRef.current.cleanup();
      }
      if (offlineCacheRef.current) {
        offlineCacheRef.current.cleanup();
      }
    };
  }, [updateConnectionState]);

  const value = {
    // SDK
    sdkReady,
    sdk: sdkRef.current,

    // Auth
    isAuthenticated,
    currentUser,
    isConnected,
    connectionState,
    login,
    logout,

    // Calls
    activeCall,
    callState,
    callHistory,
    startCall,
    endCall,
    incomingCall,
    acceptIncomingCall,
    rejectIncomingCall,

    // Chat
    messages,
    activeChat,
    sendMessage,

    // Media Controls
    toggleAudio,
    toggleVideo,

    // Conference
    activeConference,
    participants,
    joinConference,
    leaveConference,
    createConference,
    addConferenceParticipant,

    // Hardware
    audioDevices,
    videoDevices,
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,

    // Streams
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,

    // Notifications
    notification,
    showNotification,

    // Persistence
    persistence: persistenceHandlerRef.current,
    callHandler: callHandlerRef.current,
    eventHandler: eventHandlerRef.current,
    conferenceHandler: conferenceHandlerRef.current,
    incomingCallHandler: incomingCallHandlerRef.current,
    connectionHandler: connectionHandlerRef.current,

    // Presence & Offline
    contactsPresence,
    presenceManager: presenceManagerRef.current,
    offlineCache: offlineCacheRef.current,

    // Internal
    updateConnectionState,
  };

  return (
    <VoxImplantContext.Provider value={value}>
      {children}
    </VoxImplantContext.Provider>
  );
}

export default VoxImplantContext;