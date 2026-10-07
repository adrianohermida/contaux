/**
 * Wrapper do Voximplant SDK
 * Gerencia inicialização e eventos do SDK
 */

import { VoxLogger } from './logger';

const logger = new VoxLogger('VoxSDK');

class VoxImplantSDK {
  constructor(appId) {
    this.appId = appId;
    this.sdk = null;
    this.client = null;
    this.isInitialized = false;
    this.eventListeners = {};
  }

  /**
   * Inicializar SDK
   */
  async init() {
    try {
      logger.info('Inicializando Voximplant SDK...');
      
      if (typeof VoxImplant === 'undefined') {
        throw new Error('Voximplant SDK não foi carregado. Verifique a tag script.');
      }

      this.sdk = VoxImplant;
      this.client = this.sdk.getInstance();
      
      this.isInitialized = true;
      logger.success('SDK inicializado com sucesso');
      
      return true;
    } catch (error) {
      logger.error('Erro ao inicializar SDK:', error);
      return false;
    }
  }

  /**
   * Login no Voximplant
   */
  async login(username, password) {
    try {
      if (!this.isInitialized) {
        throw new Error('SDK não foi inicializado');
      }

      logger.info(`Fazendo login como: ${username}`);
      
      const state = await this.client.login(
        `${username}@${this.appId}.voximplant.com`,
        password
      );

      logger.success(`Login bem-sucedido: ${state}`);
      return true;
    } catch (error) {
      logger.error('Erro ao fazer login:', error);
      return false;
    }
  }

  /**
   * Fazer logout
   */
  async logout() {
    try {
      logger.info('Fazendo logout...');
      
      if (this.client) {
        await this.client.disconnect();
      }
      
      logger.success('Logout bem-sucedido');
      return true;
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      return false;
    }
  }

  /**
   * Fazer chamada
   */
  makeCall(targetUser, callType = 'voice', video = false) {
    try {
      logger.info(`Iniciando chamada ${callType} para: ${targetUser}`);
      
      if (!this.client) {
        throw new Error('Cliente não inicializado');
      }

      const call = this.client.call(targetUser, { video });
      logger.info('Chamada iniciada:', { targetUser, callType, video });
      
      return call;
    } catch (error) {
      logger.error('Erro ao fazer chamada:', error);
      return null;
    }
  }

  /**
   * Responder chamada
   */
  answerCall(call, video = false) {
    try {
      logger.info('Respondendo chamada...');
      call.answer({ video });
      logger.success('Chamada respondida');
      return true;
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
      call.reject();
      logger.success('Chamada rejeitada');
      return true;
    } catch (error) {
      logger.error('Erro ao rejeitar chamada:', error);
      return false;
    }
  }

  /**
   * Desligar chamada
   */
  hangupCall(call) {
    try {
      logger.info('Desligando chamada...');
      call.hangup();
      logger.success('Chamada desligada');
      return true;
    } catch (error) {
      logger.error('Erro ao desligar chamada:', error);
      return false;
    }
  }

  /**
   * Registrar listener de evento
   */
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
    
    if (this.client) {
      this.client.on(eventName, callback);
    }
    
    logger.debug(`Event listener registrado: ${eventName}`);
  }

  /**
   * Remover listener de evento
   */
  off(eventName, callback) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName] = this.eventListeners[eventName].filter(
        cb => cb !== callback
      );
    }
    
    if (this.client) {
      this.client.off(eventName, callback);
    }
    
    logger.debug(`Event listener removido: ${eventName}`);
  }

  /**
   * Habilitar áudio
   */
  enableAudio(call, enabled = true) {
    try {
      if (call && call.localAudio) {
        call.localAudio.enabled = enabled;
        logger.info(`Áudio ${enabled ? 'habilitado' : 'desabilitado'}`);
        return true;
      }
    } catch (error) {
      logger.error('Erro ao controlar áudio:', error);
    }
    return false;
  }

  /**
   * Habilitar vídeo
   */
  enableVideo(call, enabled = true) {
    try {
      if (call && call.localVideo) {
        call.localVideo.enabled = enabled;
        logger.info(`Vídeo ${enabled ? 'habilitado' : 'desabilitado'}`);
        return true;
      }
    } catch (error) {
      logger.error('Erro ao controlar vídeo:', error);
    }
    return false;
  }

  /**
   * Enviar mensagem de chat
   */
  sendMessage(targetUser, message) {
    try {
      logger.info(`Enviando mensagem para ${targetUser}:`, message);
      
      if (this.client) {
        this.client.sendMessage(targetUser, message);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  /**
   * Obter informações do SDK
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      appId: this.appId,
      clientStatus: this.client ? 'active' : 'inactive',
    };
  }
}

export default VoxImplantSDK;