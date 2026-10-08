/**
 * useWebSocketManager Hook
 * WebSocket connection management and real-time communication
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useWebSocketManager(url) {
  const wsRef = useRef(null);
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isConnecting: false,
    lastConnected: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
  });

  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    sent: 0,
    received: 0,
    errors: 0,
    latency: 0,
  });

  const messageHandlers = useRef(new Map());

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnectionState((prev) => ({ ...prev, isConnecting: true }));

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        }));
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const receivedMessage = {
          id: Date.now() + Math.random(),
          data: message,
          timestamp: Date.now(),
          direction: 'received',
        };

        setMessages((prev) => [receivedMessage, ...prev]);
        setStats((prev) => ({ ...prev, received: prev.received + 1 }));

        // Trigger handlers
        if (messageHandlers.current.has(message.type)) {
          messageHandlers.current.get(message.type)(message);
        }
      };

      wsRef.current.onerror = () => {
        setStats((prev) => ({ ...prev, errors: prev.errors + 1 }));
      };

      wsRef.current.onclose = () => {
        setConnectionState((prev) => {
          const newAttempts = prev.reconnectAttempts + 1;
          if (newAttempts < prev.maxReconnectAttempts) {
            setTimeout(connect, 3000 * newAttempts); // Exponential backoff
          }
          return {
            ...prev,
            isConnected: false,
            isConnecting: false,
            reconnectAttempts: newAttempts,
          };
        });
      };
    } catch (error) {
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: false,
      }));
    }
  }, [url]);

  // Send message
  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const startTime = performance.now();
      wsRef.current.send(JSON.stringify(data));

      const sentMessage = {
        id: Date.now() + Math.random(),
        data,
        timestamp: Date.now(),
        direction: 'sent',
      };

      setMessages((prev) => [sentMessage, ...prev]);
      setStats((prev) => ({
        ...prev,
        sent: prev.sent + 1,
        latency: performance.now() - startTime,
      }));

      return true;
    }
    return false;
  }, []);

  // Subscribe to message type
  const subscribe = useCallback((type, handler) => {
    messageHandlers.current.set(type, handler);
    return () => messageHandlers.current.delete(type);
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
    }));
  }, []);

  // Get connection status
  const getStatus = useCallback(() => {
    return {
      ...connectionState,
      messageCount: messages.length,
      stats,
    };
  }, [connectionState, messages, stats]);

  // Auto connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connectionState,
    messages,
    stats,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    getStatus,
  };
}

export default useWebSocketManager;