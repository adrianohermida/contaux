/**
 * Gerenciador de eventos do Voximplant
 * Integra SDK com aplicação
 */

import { VoxLogger } from './logger';
import { VOX_EVENTS, CALL_STATES } from './config';

const logger = new VoxLogger('EventHandler');

export class EventHandler {
  constructor(sdk, context) {
    this.sdk = sdk;
    this.context = context; // VoxImplantContext
    this.listeners = new Map();
  }

  /**
   * Registrar listeners de eventos do SDK
   */
  registerEvents() {
    try {
      if (!this.sdk || !this.sdk.client) {
        logger.warn('SDK client não disponível para registrar eventos');
        return;
      }

      // Chamada recebida
      this.sdk.on(VOX_EVENTS.INCOMING_CALL, (call) => this._handleIncomingCall(call));

      // Conexão estabelecida
      this.sdk.on(VOX_EVENTS.CONNECTION_ESTABLISHED, () => {
        logger.success('Conexão estabelecida');
        this.context.updateConnectionState('CONNECTED');
      });

      // Conexão perdida
      this.sdk.on(VOX_EVENTS.CONNECTION_FAILED, (error) => {
        logger.error('Falha na conexão:', error);
        this.context.updateConnectionState('FAILED');
      });

      // Desconectado
      this.sdk.on(VOX_EVENTS.CONNECTION_CLOSED, () => {
        logger.info('Conexão fechada');
        this.context.updateConnectionState('DISCONNECTED');
      });

      logger.success('Event listeners registrados');
    } catch (error) {
      logger.error('Erro ao registrar eventos:', error);
    }
  }

  /**
   * Manipular chamada recebida
   */
  async _handleIncomingCall(call) {
    try {
      logger.info('Chamada recebida:', call);

      const callerDisplayName = call.from || call.senderId || 'Desconhecido';
      
      this.context.showNotification(`Chamada de ${callerDisplayName}`, 'info');

      // Aqui você pode implementar lógica de resposta automática
      // ou deixar o usuário decidir
    } catch (error) {
      logger.error('Erro ao manipular chamada recebida:', error);
    }
  }

  /**
   * Registrar listener customizado
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    logger.debug(`Custom listener registrado: ${eventName}`);
  }

  /**
   * Remover listener customizado
   */
  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Disparar evento customizado
   */
  emit(eventName, data) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Erro ao disparar evento ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Limpar listeners
   */
  cleanup() {
    this.listeners.clear();
    logger.info('EventHandler limpo');
  }
}

export default EventHandler;