/**
 * Configurações do Voximplant SDK
 * Centraliza constantes, credenciais e parâmetros
 */

// App ID do Voximplant
export const VOX_APP_ID = import.meta.env.VITE_VOX_APP_ID || '1234567';

// Configurações do SDK
export const SDK_CONFIG = {
  applicationId: VOX_APP_ID,
  logLevel: import.meta.env.DEV ? 'DEBUG' : 'WARN',
};

// Configurações de chamadas
export const CALL_CONFIG = {
  videoCodec: 'VP8',
  audioCodec: 'OPUS',
  ice_servers: [],
  statsInterval: 1000,
};

// Configurações de conference
export const CONFERENCE_CONFIG = {
  maxParticipants: 100,
  recordingEnabled: false,
  quality: 'HD',
};

// Configurações de chat
export const CHAT_CONFIG = {
  maxMessageLength: 4096,
  typingIndicatorTimeout: 3000,
};

// Configurações de hardware
export const HARDWARE_CONFIG = {
  audioInputDefaults: { sampleRate: 48000, channelCount: 1 },
  videoInputDefaults: { width: 1280, height: 720, frameRate: 30 },
};

// Configurações de rede
export const NETWORK_CONFIG = {
  connectionTimeout: 30000,
  reconnectAttempts: 3,
  reconnectDelay: 1000,
  statsInterval: 5000,
};

/**
 * Estados de chamada
 */
export const CALL_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  RINGING: 'ringing',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  ENDED: 'ended',
  FAILED: 'failed',
};

/**
 * Tipos de chamada
 */
export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video',
};

/**
 * Estados de conexão
 */
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
};

/**
 * Estados de participante em conference
 */
export const PARTICIPANT_STATES = {
  JOINING: 'joining',
  ACTIVE: 'active',
  IDLE: 'idle',
  LEAVING: 'leaving',
  LEFT: 'left',
};

/**
 * Eventos do Voximplant SDK
 */
export const VOX_EVENTS = {
  // Autenticação
  LOGIN_SUCCESS: 'VoxEngine.loginSuccess',
  LOGIN_FAILED: 'VoxEngine.loginFailed',
  SESSION_STARTED: 'VoxEngine.sessionStarted',
  SESSION_ENDED: 'VoxEngine.sessionEnded',

  // Chamadas
  CALL_CONNECTED: 'VoxEngine.callConnected',
  CALL_DISCONNECTED: 'VoxEngine.callDisconnected',
  CALL_FAILED: 'VoxEngine.callFailed',
  CALL_RINGING: 'VoxEngine.callRinging',
  CALL_ALERT: 'VoxEngine.callAlert',

  // Chat
  MESSAGE_RECEIVED: 'VoxEngine.messageReceived',
  MESSAGE_FAILED: 'VoxEngine.messageFailed',
  TYPING_STARTED: 'VoxEngine.typingStarted',
  TYPING_STOPPED: 'VoxEngine.typingStopped',

  // Conference
  CONFERENCE_JOINED: 'VoxEngine.conferenceJoined',
  CONFERENCE_LEFT: 'VoxEngine.conferenceLeft',
  PARTICIPANT_JOINED: 'VoxEngine.participantJoined',
  PARTICIPANT_LEFT: 'VoxEngine.participantLeft',

  // Media
  STREAM_RECEIVED: 'VoxEngine.streamReceived',
  STREAM_REMOVED: 'VoxEngine.streamRemoved',
  CAMERA_CHANGED: 'VoxEngine.cameraChanged',
  MICROPHONE_CHANGED: 'VoxEngine.microphoneChanged',

  // Conexão
  CONNECTION_ESTABLISHED: 'VoxEngine.connectionEstablished',
  CONNECTION_CLOSED: 'VoxEngine.connectionClosed',
  CONNECTION_FAILED: 'VoxEngine.connectionFailed',

  // Stats
  STATS_READY: 'VoxEngine.statsReady',
};

/**
 * Tipos de notificação
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Códigos de erro
 */
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  CALL_FAILED: 'CALL_FAILED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export default {
  VOX_APP_ID,
  SDK_CONFIG,
  CALL_CONFIG,
  CONFERENCE_CONFIG,
  CHAT_CONFIG,
  HARDWARE_CONFIG,
  NETWORK_CONFIG,
  CALL_STATES,
  CALL_TYPES,
  CONNECTION_STATES,
  PARTICIPANT_STATES,
  VOX_EVENTS,
  NOTIFICATION_TYPES,
  ERROR_CODES,
};