/**
 * Gerenciador de chamadas
 * Encapsula a lógica de voz/vídeo
 */

import { VoxLogger } from './logger';
import { CALL_STATES, CALL_TYPES } from './config';

const logger = new VoxLogger('CallHandler');

export class CallHandler {
  constructor(sdk, onCallStateChange, onStreamReceived) {
    this.sdk = sdk;
    this.onCallStateChange = onCallStateChange;
    this.onStreamReceived = onStreamReceived;
    this.currentCall = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  /**
   * Fazer chamada de voz ou vídeo
   */
  async makeCall(targetUser, options = {}) {
    try {
      const { video = false } = options;
      logger.info(`Iniciando chamada ${video ? 'vídeo' : 'voz'} para: ${targetUser}`);

      if (!this.sdk) {
        throw new Error('SDK não está disponível');
      }

      this.currentCall = this.sdk.makeCall(targetUser, CALL_TYPES.VOICE, video);
      
      if (!this.currentCall) {
        throw new Error('Falha ao criar chamada');
      }

      this._setupCallListeners(this.currentCall);
      this.onCallStateChange(CALL_STATES.CONNECTING);

      logger.success('Chamada iniciada com sucesso');
      return this.currentCall;
    } catch (error) {
      logger.error('Erro ao fazer chamada:', error);
      this.onCallStateChange(CALL_STATES.FAILED);
      return null;
    }
  }

  /**
   * Responder chamada
   */
  async answerCall(call, options = {}) {
    try {
      const { video = false } = options;
      logger.info('Respondendo chamada...');

      this.currentCall = call;
      this._setupCallListeners(call);

      const success = this.sdk.answerCall(call, video);
      
      if (success) {
        this.onCallStateChange(CALL_STATES.ACTIVE);
        logger.success('Chamada respondida');
      }

      return success;
    } catch (error) {
      logger.error('Erro ao responder chamada:', error);
      return false;
    }
  }

  /**
   * Rejeitar chamada
   */
  rejectCall(call) {
    try {
      logger.info('Rejeitando chamada...');
      const success = this.sdk.rejectCall(call);
      
      if (success) {
        this.onCallStateChange(CALL_STATES.ENDED);
        logger.success('Chamada rejeitada');
      }

      return success;
    } catch (error) {
      logger.error('Erro ao rejeitar chamada:', error);
      return false;
    }
  }

  /**
   * Desligar chamada
   */
  hangup() {
    try {
      if (!this.currentCall) {
        throw new Error('Nenhuma chamada ativa');
      }

      logger.info('Desligando chamada...');
      this.sdk.hangupCall(this.currentCall);
      
      this.currentCall = null;
      this.localStream = null;
      this.remoteStream = null;
      
      this.onCallStateChange(CALL_STATES.ENDED);
      logger.success('Chamada finalizada');
      
      return true;
    } catch (error) {
      logger.error('Erro ao desligar chamada:', error);
      return false;
    }
  }

  /**
   * Mutear/desnutar áudio
   */
  toggleAudio(enabled) {
    try {
      if (!this.currentCall) {
        throw new Error('Nenhuma chamada ativa');
      }

      const success = this.sdk.enableAudio(this.currentCall, enabled);
      
      if (success) {
        logger.info(`Áudio ${enabled ? 'habilitado' : 'desabilitado'}`);
      }

      return success;
    } catch (error) {
      logger.error('Erro ao controlar áudio:', error);
      return false;
    }
  }

  /**
   * Habilitar/desabilitar vídeo
   */
  toggleVideo(enabled) {
    try {
      if (!this.currentCall) {
        throw new Error('Nenhuma chamada ativa');
      }

      const success = this.sdk.enableVideo(this.currentCall, enabled);
      
      if (success) {
        logger.info(`Vídeo ${enabled ? 'habilitado' : 'desabilitado'}`);
      }

      return success;
    } catch (error) {
      logger.error('Erro ao controlar vídeo:', error);
      return false;
    }
  }

  /**
   * Configurar listeners da chamada
   */
  _setupCallListeners(call) {
    // Chamada conectada
    call.on('connected', () => {
      logger.success('Chamada conectada');
      this.onCallStateChange(CALL_STATES.ACTIVE);
    });

    // Chamada desconectada
    call.on('disconnected', () => {
      logger.info('Chamada desconectada');
      this.currentCall = null;
      this.onCallStateChange(CALL_STATES.ENDED);
    });

    // Stream remoto recebido
    call.on('mediaReceived', (event) => {
      logger.info('Stream remoto recebido');
      if (event.stream) {
        this.remoteStream = event.stream;
        this.onStreamReceived('remote', event.stream);
      }
    });

    // Erro na chamada
    call.on('failed', (event) => {
      logger.error('Erro na chamada:', event);
      this.onCallStateChange(CALL_STATES.FAILED);
    });
  }

  /**
   * Obter informações da chamada
   */
  getCallInfo() {
    if (!this.currentCall) {
      return null;
    }

    return {
      id: this.currentCall.id,
      endpointId: this.currentCall.endpointId,
      state: this.currentCall.state,
      direction: this.currentCall.direction,
      startTime: this.currentCall.startTime,
    };
  }

  /**
   * Limpar recursos
   */
  cleanup() {
    try {
      if (this.currentCall) {
        this.hangup();
      }
      logger.info('CallHandler limpo');
    } catch (error) {
      logger.error('Erro ao limpar CallHandler:', error);
    }
  }
}

export default CallHandler;