/**
 * useWebSocket Hook
 * Manage WebSocket connection for real-time features
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

export function useWebSocket(channel = null, userId = null) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const reconnectCountRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket
  useEffect(() => {
    if (!channel || !userId) return;

    const connect = () => {
      try {
        const url = `${WS_URL}?channel=${channel}&userId=${userId}`;
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          setError(null);
          reconnectCountRef.current = 0;
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        wsRef.current.onerror = (error) => {
          setError('WebSocket connection error');
          console.error('WebSocket error:', error);
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          // Attempt reconnection with exponential backoff
          if (reconnectCountRef.current < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectCountRef.current) * 1000;
            reconnectCountRef.current++;
            setTimeout(connect, delay);
          }
        };
      } catch (err) {
        setError('Failed to create WebSocket connection');
        console.error('WebSocket connection error:', err);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [channel, userId]);

  // Send message through WebSocket
  const sendMessage = useCallback(
    (message) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(message));
        } catch (err) {
          console.error('Failed to send WebSocket message:', err);
        }
      } else {
        console.warn('WebSocket not connected');
      }
    },
    []
  );

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    ws: wsRef.current,
  };
}

export default useWebSocket;