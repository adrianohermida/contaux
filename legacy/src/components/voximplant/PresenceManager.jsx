import React, { useState, useCallback, useEffect } from 'react';

/**
 * Gerencia status de presença de contatos em tempo real
 * Usa WebSocket/API polling para sincronizar status online
 */
export class PresenceManager {
  constructor(sdk) {
    this.sdk = sdk;
    this.contactsStatus = new Map();
    this.statusSubscribers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Inicializar gerenciador de presença
   */
  init() {
    try {
      if (this.sdk && this.sdk.onUserStatusChanged) {
        this.sdk.onUserStatusChanged((userId, status) => {
          this.updateContactStatus(userId, status);
        });
      }
      return true;
    } catch (error) {
      console.error('Erro ao inicializar PresenceManager:', error);
      return false;
    }
  }

  /**
   * Atualizar status de um contato
   */
  updateContactStatus(contactId, status) {
    this.contactsStatus.set(contactId, {
      status, // 'online', 'offline', 'busy', 'dnd'
      timestamp: new Date(),
    });

    // Notificar todos os subscribers
    this.statusSubscribers.forEach(callback => {
      callback(contactId, status);
    });
  }

  /**
   * Obter status de um contato
   */
  getContactStatus(contactId) {
    return this.contactsStatus.get(contactId) || { status: 'offline', timestamp: null };
  }

  /**
   * Se inscrever em mudanças de status
   */
  subscribe(callback) {
    this.statusSubscribers.add(callback);
    return () => this.statusSubscribers.delete(callback);
  }

  /**
   * Publicar status do usuário atual
   */
  publishStatus(status) {
    try {
      if (this.sdk && this.sdk.publishPresence) {
        this.sdk.publishPresence(status);
      }
    } catch (error) {
      console.error('Erro ao publicar presença:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.statusSubscribers.clear();
    this.contactsStatus.clear();
  }
}

export default PresenceManager;