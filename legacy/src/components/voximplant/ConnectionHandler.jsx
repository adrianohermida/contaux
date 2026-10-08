/**
 * Gerenciador de conexão
 * Monitora estado de conexão e reconexão automática
 */

import { VoxLogger } from './logger';
import { CONNECTION_STATES } from './config';

const logger = new VoxLogger('ConnectionHandler');

export class ConnectionHandler {
  constructor(sdk, onConnectionStateChange) {
    this.sdk = sdk;
    this.onConnectionStateChange = onConnectionStateChange;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 segundo
    this.reconnectTimeout = null;
  }

  /**
   * Registrar handlers de conexão
   */
  registerConnectionHandlers() {
    try {
      if (!this.sdk || !this.sdk.client) {
        logger.warn('SDK client não disponível');
        return;
      }

      // Conexão estabelecida
      this.sdk.on('connectionestablished', () => {
        this._handleConnectionEstablished();
      });

      // Conexão falhou
      this.sdk.on('connectionfailed', (error) => {
        this._handleConnectionFailed(error);
      });

      // Desconexão
      this.sdk.on('connectionclosed', () => {
        this._handleConnectionClosed();
      });

      logger.success('Handlers de conexão registrados');
    } catch (error) {
      logger.error('Erro ao registrar handlers de conexão:', error);
    }
  }

  /**
   * Manipular conexão estabelecida
   */
  _handleConnectionEstablished() {
    logger.success('Conexão estabelecida com sucesso');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.onConnectionStateChange(CONNECTION_STATES.CONNECTED);
  }

  /**
   * Manipular falha de conexão
   */
  _handleConnectionFailed(error) {
    logger.error('Falha na conexão:', error);
    this.isConnected = false;
    this.onConnectionStateChange(CONNECTION_STATES.FAILED);

    // Tentar reconectar
    this._attemptReconnect();
  }

  /**
   * Manipular desconexão
   */
  _handleConnectionClosed() {
    logger.info('Conexão fechada');
    this.isConnected = false;
    this.onConnectionStateChange(CONNECTION_STATES.DISCONNECTED);
  }

  /**
   * Tentar reconectar
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Máximo de tentativas de reconexão atingido');
      this.onConnectionStateChange(CONNECTION_STATES.FAILED);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    logger.info(
      `Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts}) em ${delay}ms`
    );

    this.onConnectionStateChange(CONNECTION_STATES.RECONNECTING);

    this.reconnectTimeout = setTimeout(() => {
      this._performReconnect();
    }, delay);
  }

  /**
   * Executar reconexão
   */
  async _performReconnect() {
    try {
      if (!this.sdk || !this.sdk.client) {
        throw new Error('SDK não disponível');
      }

      logger.info('Executando reconexão...');
      // SDK deve gerenciar a reconexão automaticamente
      // Esta é uma hook para lógica customizada se necessário
    } catch (error) {
      logger.error('Erro ao reconectar:', error);
      this._attemptReconnect();
    }
  }

  /**
   * Cancelar reconexão
   */
  cancelReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Obter estado de conexão
   */
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      isReconnecting: this.reconnectTimeout !== null,
    };
  }

  /**
   * Verificar se está conectado
   */
  isOnline() {
    return this.isConnected;
  }

  /**
   * Limpar resources
   */
  cleanup() {
    this.cancelReconnect();
    logger.info('ConnectionHandler limpo');
  }
}

export default ConnectionHandler;