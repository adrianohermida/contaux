/**
 * Gerenciador de chamadas recebidas
 * Notifica e gerencia opções de aceitar/rejeitar
 */

import { VoxLogger } from './logger';

const logger = new VoxLogger('IncomingCallHandler');

export class IncomingCallHandler {
  constructor(sdk, onCallReceived, onCallRejected) {
    this.sdk = sdk;
    this.onCallReceived = onCallReceived;
    this.onCallRejected = onCallRejected;
    this.incomingCall = null;
    this.callTimeout = null;
  }

  /**
   * Registrar handler para chamadas recebidas
   */
  registerIncomingCallHandler() {
    try {
      if (!this.sdk || !this.sdk.client) {
        logger.warn('SDK client não disponível');
        return;
      }

      this.sdk.on('incomingcall', (call) => this._handleIncomingCall(call));
      logger.success('Handler de chamadas recebidas registrado');
    } catch (error) {
      logger.error('Erro ao registrar handler de chamadas:', error);
    }
  }

  /**
   * Manipular chamada recebida
   */
  _handleIncomingCall(call) {
    try {
      logger.info('Chamada recebida:', {
        from: call.from,
        displayName: call.getDisplayName?.() || call.from,
        type: call.video ? 'vídeo' : 'voz',
      });

      this.incomingCall = call;

      const callInfo = {
        id: call.id,
        from: call.from,
        displayName: call.getDisplayName?.() || call.from,
        type: call.video ? 'video' : 'voice',
        timestamp: new Date(),
      };

      // Notificar aplicação
      this.onCallReceived(callInfo);

      // Auto-reject após 30 segundos se não respondida
      this._setupCallTimeout(call);
    } catch (error) {
      logger.error('Erro ao processar chamada recebida:', error);
    }
  }

  /**
   * Aceitar chamada recebida
   */
  async acceptCall(options = {}) {
    try {
      if (!this.incomingCall) {
        throw new Error('Nenhuma chamada recebida para aceitar');
      }

      const { video = false } = options;
      logger.info('Aceitando chamada...');

      const success = this.sdk.answerCall(this.incomingCall, video);

      if (success) {
        this._clearCallTimeout();
        logger.success('Chamada aceita');
        return this.incomingCall;
      }

      return null;
    } catch (error) {
      logger.error('Erro ao aceitar chamada:', error);
      return null;
    }
  }

  /**
   * Rejeitar chamada recebida
   */
  rejectCall() {
    try {
      if (!this.incomingCall) {
        throw new Error('Nenhuma chamada recebida para rejeitar');
      }

      logger.info('Rejeitando chamada...');
      const success = this.sdk.rejectCall(this.incomingCall);

      if (success) {
        this._clearCallTimeout();
        const callInfo = this.incomingCall;
        this.incomingCall = null;

        this.onCallRejected(callInfo);
        logger.success('Chamada rejeitada');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Erro ao rejeitar chamada:', error);
      return false;
    }
  }

  /**
   * Configurar timeout para rejeição automática
   */
  _setupCallTimeout(call) {
    this._clearCallTimeout();

    this.callTimeout = setTimeout(() => {
      logger.info('Timeout de chamada atingido, rejeitando automaticamente');
      this.rejectCall();
    }, 30000); // 30 segundos
  }

  /**
   * Limpar timeout
   */
  _clearCallTimeout() {
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
      this.callTimeout = null;
    }
  }

  /**
   * Obter informações da chamada recebida
   */
  getIncomingCallInfo() {
    if (!this.incomingCall) {
      return null;
    }

    return {
      id: this.incomingCall.id,
      from: this.incomingCall.from,
      displayName: this.incomingCall.getDisplayName?.() || this.incomingCall.from,
      type: this.incomingCall.video ? 'video' : 'voice',
      timestamp: new Date(),
    };
  }

  /**
   * Verificar se há chamada recebida
   */
  hasIncomingCall() {
    return this.incomingCall !== null;
  }

  /**
   * Limpar resources
   */
  cleanup() {
    this._clearCallTimeout();
    this.incomingCall = null;
    logger.info('IncomingCallHandler limpo');
  }
}

export default IncomingCallHandler;