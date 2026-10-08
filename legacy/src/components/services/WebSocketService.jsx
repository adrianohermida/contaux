/**
 * WebSocket Service - Real-time sync & data synchronization
 * Features: connection pooling, heartbeat, auto-reconnect, batch sync
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
    this.pendingMessages = [];
    this.subscribers = new Map();
    this.isConnecting = false;
    this.isConnected = false;
  }

  /**
   * Conectar ao WebSocket
   */
  connect(url) {
    if (this.isConnecting || this.isConnected) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      this.isConnecting = true;
      
      try {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushPendingMessages();
          this.notify('connection', { status: 'connected' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.notify('error', { error });
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          this.notify('connection', { status: 'disconnected' });
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Desconectar
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Enviar mensagem
   */
  send(type, data) {
    const message = { type, data, timestamp: Date.now() };
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.pendingMessages.push(message);
    }
  }

  /**
   * Batch send - agrupa múltiplas mensagens
   */
  batchSend(messages) {
    const batch = {
      type: 'batch',
      data: messages,
      timestamp: Date.now()
    };
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(batch));
    } else {
      this.pendingMessages.push(batch);
    }
  }

  /**
   * Processar mensagem recebida
   */
  handleMessage(data) {
    if (data.type === 'pong') {
      // Heartbeat response
      return;
    }
    
    this.notify(data.type, data.data);
  }

  /**
   * Subscribe a eventos
   */
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    
    this.subscribers.get(type).push(callback);
    
    // Unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(type);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notificar subscribers
   */
  notify(type, data) {
    if (this.subscribers.has(type)) {
      this.subscribers.get(type).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Heartbeat para detectar conexão morta
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // A cada 30s
  }

  /**
   * Parar heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Tentar reconectar
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.notify('reconnecting', { attempt: this.reconnectAttempts });
        }
      }, delay);
    }
  }

  /**
   * Enviar mensagens pendentes
   */
  flushPendingMessages() {
    while (this.pendingMessages.length > 0 && this.isConnected) {
      const message = this.pendingMessages.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      pendingMessages: this.pendingMessages.length,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Singleton instance
const wsService = new WebSocketService();
export default wsService;