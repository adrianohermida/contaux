/**
 * Gerenciador de mensagens de chat
 * Encapsula a lógica de mensageria
 */

import { VoxLogger } from './logger';

const logger = new VoxLogger('ChatHandler');

export class ChatHandler {
  constructor(sdk, onMessageReceived) {
    this.sdk = sdk;
    this.onMessageReceived = onMessageReceived;
    this.conversations = new Map();
    this.unreadCount = 0;
  }

  /**
   * Enviar mensagem
   */
  sendMessage(targetUser, content) {
    try {
      logger.info(`Enviando mensagem para ${targetUser}:`, content);

      const message = {
        id: Math.random().toString(36),
        to: targetUser,
        content,
        timestamp: new Date(),
        status: 'sending',
      };

      if (this.sdk) {
        const success = this.sdk.sendMessage(targetUser, content);
        if (success) {
          message.status = 'sent';
          logger.success('Mensagem enviada');
        } else {
          message.status = 'failed';
          logger.error('Falha ao enviar mensagem');
        }
      }

      // Armazenar na conversa
      if (!this.conversations.has(targetUser)) {
        this.conversations.set(targetUser, []);
      }
      this.conversations.get(targetUser).push(message);

      return message;
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      return null;
    }
  }

  /**
   * Receber mensagem (callback)
   */
  receiveMessage(fromUser, content) {
    try {
      logger.info(`Mensagem recebida de ${fromUser}:`, content);

      const message = {
        id: Math.random().toString(36),
        from: fromUser,
        content,
        timestamp: new Date(),
        isRead: false,
      };

      if (!this.conversations.has(fromUser)) {
        this.conversations.set(fromUser, []);
      }
      this.conversations.get(fromUser).push(message);

      this.unreadCount++;
      this.onMessageReceived(message);

      logger.success('Mensagem processada');
      return message;
    } catch (error) {
      logger.error('Erro ao receber mensagem:', error);
      return null;
    }
  }

  /**
   * Marcar mensagens como lidas
   */
  markAsRead(conversationId) {
    try {
      if (this.conversations.has(conversationId)) {
        const messages = this.conversations.get(conversationId);
        messages.forEach(msg => msg.isRead = true);
        this.unreadCount = Math.max(0, this.unreadCount - messages.filter(m => !m.isRead).length);
        logger.info(`Mensagens de ${conversationId} marcadas como lidas`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao marcar como lido:', error);
      return false;
    }
  }

  /**
   * Obter conversa
   */
  getConversation(userId) {
    return this.conversations.get(userId) || [];
  }

  /**
   * Obter todas as conversas
   */
  getAllConversations() {
    return Array.from(this.conversations.entries()).map(([userId, messages]) => ({
      userId,
      messages,
      unreadCount: messages.filter(m => !m.isRead).length,
      lastMessage: messages[messages.length - 1],
    }));
  }

  /**
   * Limpar conversa
   */
  clearConversation(userId) {
    try {
      this.conversations.delete(userId);
      logger.info(`Conversa com ${userId} limpada`);
      return true;
    } catch (error) {
      logger.error('Erro ao limpar conversa:', error);
      return false;
    }
  }

  /**
   * Obter contador de não lidas
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Limpar recursos
   */
  cleanup() {
    try {
      this.conversations.clear();
      this.unreadCount = 0;
      logger.info('ChatHandler limpo');
    } catch (error) {
      logger.error('Erro ao limpar ChatHandler:', error);
    }
  }
}

export default ChatHandler;