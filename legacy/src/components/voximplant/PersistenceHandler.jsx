/**
 * Gerenciador de persistência
 * Salva histórico de chamadas e mensagens em Base44
 */

import { VoxLogger } from './logger';
import { base44 } from '@/api/base44Client';

const logger = new VoxLogger('PersistenceHandler');

export class PersistenceHandler {
  constructor() {
    this.callStartTime = null;
  }

  /**
   * Salvar chamada no histórico
   */
  async saveCallHistory(callData) {
    try {
      const {
        clientId,
        contactName,
        callType,
        status,
        startTime,
        endTime,
      } = callData;

      // Calcular duração em segundos
      const durationSeconds = endTime && startTime
        ? Math.floor((new Date(endTime) - new Date(startTime)) / 1000)
        : 0;

      const historyEntry = {
        client_id: clientId,
        contact_name: contactName,
        call_type: callType || 'voice',
        status: status || 'completed',
        call_start_time: startTime,
        call_end_time: endTime,
        duration_seconds: durationSeconds,
      };

      const result = await base44.entities.CallHistory.create(historyEntry);
      logger.success('Chamada salva no histórico:', result);
      return result;
    } catch (error) {
      logger.error('Erro ao salvar histórico de chamadas:', error);
      return null;
    }
  }

  /**
   * Salvar mensagem de chat
   */
  async saveChatMessage(messageData) {
    try {
      const {
        clientId,
        contactName,
        fromUser,
        content,
        messageType = 'text',
      } = messageData;

      const message = {
        client_id: clientId,
        contact_name: contactName,
        from_user: fromUser,
        content,
        message_type: messageType,
        is_read: false,
      };

      const result = await base44.entities.ChatMessage.create(message);
      logger.success('Mensagem salva:', result);
      return result;
    } catch (error) {
      logger.error('Erro ao salvar mensagem:', error);
      return null;
    }
  }

  /**
   * Obter histórico de chamadas
   */
  async getCallHistory(clientId = null, limit = 50) {
    try {
      const query = clientId ? { client_id: clientId } : {};
      const history = await base44.entities.CallHistory.list();
      
      let filtered = history;
      if (clientId) {
        filtered = history.filter(h => h.client_id === clientId);
      }

      logger.info(`Histórico de ${filtered.length} chamadas carregado`);
      return filtered.slice(-limit);
    } catch (error) {
      logger.error('Erro ao obter histórico de chamadas:', error);
      return [];
    }
  }

  /**
   * Obter mensagens de um contato
   */
  async getChatMessages(clientId, limit = 100) {
    try {
      const messages = await base44.entities.ChatMessage.list();
      const filtered = messages.filter(m => m.client_id === clientId);
      
      logger.info(`${filtered.length} mensagens carregadas para cliente ${clientId}`);
      return filtered.slice(-limit);
    } catch (error) {
      logger.error('Erro ao obter mensagens:', error);
      return [];
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async markMessageAsRead(messageId) {
    try {
      const result = await base44.entities.ChatMessage.update(messageId, {
        is_read: true,
      });
      logger.info('Mensagem marcada como lida');
      return result;
    } catch (error) {
      logger.error('Erro ao marcar mensagem como lida:', error);
      return null;
    }
  }

  /**
   * Obter estatísticas de chamadas
   */
  async getCallStats(clientId = null) {
    try {
      const history = await this.getCallHistory(clientId);
      
      const stats = {
        totalCalls: history.length,
        completedCalls: history.filter(c => c.status === 'completed').length,
        missedCalls: history.filter(c => c.status === 'missed').length,
        totalDuration: history.reduce((sum, c) => sum + (c.duration_seconds || 0), 0),
        averageDuration: 0,
      };

      if (stats.completedCalls > 0) {
        stats.averageDuration = Math.floor(
          stats.totalDuration / stats.completedCalls
        );
      }

      logger.info('Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      logger.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  }

  /**
   * Limpar dados antigos (mais de 30 dias)
   */
  async cleanupOldData(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const history = await base44.entities.CallHistory.list();
      const oldRecords = history.filter(h => {
        const recordDate = new Date(h.created_date);
        return recordDate < cutoffDate;
      });

      logger.info(`Encontrados ${oldRecords.length} registros antigos para limpeza`);
      // Implementar deleção em lote se necessário
      
      return oldRecords.length;
    } catch (error) {
      logger.error('Erro ao limpar dados antigos:', error);
      return 0;
    }
  }
}

export default PersistenceHandler;