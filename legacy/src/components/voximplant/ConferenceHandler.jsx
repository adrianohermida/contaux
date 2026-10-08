/**
 * Gerenciador de conference calls
 * Suporta múltiplos participantes
 */

import { VoxLogger } from './logger';

const logger = new VoxLogger('ConferenceHandler');

export class ConferenceHandler {
  constructor(sdk) {
    this.sdk = sdk;
    this.activeConference = null;
    this.participants = new Map();
  }

  /**
   * Criar nova conferência
   */
  async createConference(roomId, options = {}) {
    try {
      const { maxParticipants = 10 } = options;

      logger.info(`Criando conferência: ${roomId} (máx: ${maxParticipants} participantes)`);

      this.activeConference = {
        id: roomId,
        createdAt: new Date(),
        maxParticipants,
        participants: [],
        isActive: true,
      };

      logger.success('Conferência criada com sucesso');
      return this.activeConference;
    } catch (error) {
      logger.error('Erro ao criar conferência:', error);
      return null;
    }
  }

  /**
   * Adicionar participante à conferência
   */
  addParticipant(participantId, participantName, options = {}) {
    try {
      if (!this.activeConference) {
        throw new Error('Nenhuma conferência ativa');
      }

      if (this.participants.size >= this.activeConference.maxParticipants) {
        throw new Error('Número máximo de participantes atingido');
      }

      const participant = {
        id: participantId,
        name: participantName,
        joinedAt: new Date(),
        isMuted: options.isMuted || false,
        isVideoOn: options.isVideoOn || false,
      };

      this.participants.set(participantId, participant);
      this.activeConference.participants.push(participant);

      logger.info(`Participante ${participantName} adicionado à conferência`);
      return participant;
    } catch (error) {
      logger.error('Erro ao adicionar participante:', error);
      return null;
    }
  }

  /**
   * Remover participante da conferência
   */
  removeParticipant(participantId) {
    try {
      if (!this.activeConference) {
        throw new Error('Nenhuma conferência ativa');
      }

      const participant = this.participants.get(participantId);
      if (!participant) {
        throw new Error('Participante não encontrado');
      }

      this.participants.delete(participantId);
      this.activeConference.participants = this.activeConference.participants.filter(
        p => p.id !== participantId
      );

      logger.info(`Participante ${participant.name} removido da conferência`);
      return true;
    } catch (error) {
      logger.error('Erro ao remover participante:', error);
      return false;
    }
  }

  /**
   * Mudar áudio de um participante
   */
  toggleParticipantAudio(participantId, enabled) {
    try {
      const participant = this.participants.get(participantId);
      if (!participant) {
        throw new Error('Participante não encontrado');
      }

      participant.isMuted = !enabled;
      logger.info(
        `Áudio do participante ${participant.name} ${enabled ? 'ativado' : 'desativado'}`
      );
      return true;
    } catch (error) {
      logger.error('Erro ao controlar áudio do participante:', error);
      return false;
    }
  }

  /**
   * Mudar vídeo de um participante
   */
  toggleParticipantVideo(participantId, enabled) {
    try {
      const participant = this.participants.get(participantId);
      if (!participant) {
        throw new Error('Participante não encontrado');
      }

      participant.isVideoOn = enabled;
      logger.info(
        `Vídeo do participante ${participant.name} ${enabled ? 'ativado' : 'desativado'}`
      );
      return true;
    } catch (error) {
      logger.error('Erro ao controlar vídeo do participante:', error);
      return false;
    }
  }

  /**
   * Obter informações da conferência
   */
  getConferenceInfo() {
    if (!this.activeConference) {
      return null;
    }

    return {
      id: this.activeConference.id,
      createdAt: this.activeConference.createdAt,
      participantCount: this.participants.size,
      participants: Array.from(this.participants.values()),
      maxParticipants: this.activeConference.maxParticipants,
      duration: Math.floor(
        (new Date() - this.activeConference.createdAt) / 1000
      ),
    };
  }

  /**
   * Finalizar conferência
   */
  endConference() {
    try {
      if (!this.activeConference) {
        throw new Error('Nenhuma conferência ativa');
      }

      logger.info(`Finalizando conferência: ${this.activeConference.id}`);

      const info = this.getConferenceInfo();
      this.activeConference = null;
      this.participants.clear();

      logger.success('Conferência finalizada');
      return info;
    } catch (error) {
      logger.error('Erro ao finalizar conferência:', error);
      return null;
    }
  }

  /**
   * Verificar se há conferência ativa
   */
  hasActiveConference() {
    return this.activeConference !== null && this.activeConference.isActive;
  }

  /**
   * Obter número de participantes
   */
  getParticipantCount() {
    return this.participants.size;
  }
}

export default ConferenceHandler;