import React, { useEffect, useRef, useCallback, useState } from 'react';

class WSManager {
  constructor(workspaceId) {
    this.workspaceId = workspaceId;
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.isConnected = false;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws/${this.workspaceId}`;
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
        this.broadcastToSubscribers({ type: 'connection', status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.broadcastToSubscribers(data);
        } catch (err) {
          console.error('Erro ao parsear mensagem WebSocket:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
        this.broadcastToSubscribers({ type: 'connection', status: 'error' });
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.isConnected = false;
        this.broadcastToSubscribers({ type: 'connection', status: 'disconnected' });
        this.attemptReconnect();
      };
    } catch (err) {
      console.error('Erro ao conectar WebSocket:', err);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    }
  }

  subscribe(callback, eventType = null) {
    const id = Math.random().toString(36);
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Map());
    }
    this.subscribers.get(eventType).set(id, callback);

    return () => {
      this.subscribers.get(eventType)?.delete(id);
    };
  }

  broadcastToSubscribers(data) {
    const eventType = data.type;
    
    // Broadcast to all subscribers
    if (this.subscribers.has(null)) {
      this.subscribers.get(null).forEach(callback => callback(data));
    }

    // Broadcast to specific event subscribers
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).forEach(callback => callback(data));
    }
  }

  send(message) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export function useWebSocket(workspaceId) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!workspaceId) return;

    if (!wsRef.current) {
      wsRef.current = new WSManager(workspaceId);
      wsRef.current.connect();
    }

    const unsubscribe = wsRef.current.subscribe((data) => {
      if (data.type === 'connection') {
        setStatus(data.status);
      }
    }, 'connection');

    return () => {
      unsubscribe();
    };
  }, [workspaceId]);

  return {
    ws: wsRef.current,
    status,
    send: useCallback((message) => {
      wsRef.current?.send(message);
    }, []),
    subscribe: useCallback((callback, eventType) => {
      return wsRef.current?.subscribe(callback, eventType) || (() => {});
    }, []),
    disconnect: useCallback(() => {
      wsRef.current?.disconnect();
    }, [])
  };
}

export default WSManager;