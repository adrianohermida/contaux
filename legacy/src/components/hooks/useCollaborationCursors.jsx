/**
 * useCollaborationCursors Hook
 * Track and display multiple users' cursors in real-time
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export function useCollaborationCursors(channel, userId, userName = 'User') {
  const [remoteCursors, setRemoteCursors] = useState({});
  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });
  const cursorTimerRef = useRef(null);
  const lastSentRef = useRef({ x: 0, y: 0, time: 0 });

  const { isConnected, sendMessage, lastMessage } = useWebSocket(channel, userId);

  // Track local cursor movement (throttled)
  useEffect(() => {
    const handleMouseMove = (e) => {
      setLocalCursor({ x: e.clientX, y: e.clientY });

      const now = Date.now();
      // Only send cursor updates every 100ms to reduce network traffic
      if (
        isConnected &&
        (now - lastSentRef.current.time > 100 ||
          (Math.abs(e.clientX - lastSentRef.current.x) > 10 &&
            Math.abs(e.clientY - lastSentRef.current.y) > 10))
      ) {
        sendMessage({
          type: 'cursor_move',
          channel,
          userId,
          userName,
          cursor: { x: e.clientX, y: e.clientY },
          timestamp: new Date().toISOString(),
        });
        lastSentRef.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isConnected, channel, userId, userName, sendMessage]);

  // Handle incoming cursor updates
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'cursor_move') return;

    const { userId: remoterId, userName: remoteUserName, cursor } = lastMessage;
    
    if (remoterId !== userId) {
      setRemoteCursors(prev => ({
        ...prev,
        [remoterId]: {
          userId: remoterId,
          userName: remoteUserName,
          x: cursor.x,
          y: cursor.y,
          lastUpdated: new Date(),
        },
      }));

      // Remove cursor after 5 seconds of inactivity
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
      }
      cursorTimerRef.current = setTimeout(() => {
        setRemoteCursors(prev => {
          const updated = { ...prev };
          delete updated[remoterId];
          return updated;
        });
      }, 5000);
    }
  }, [lastMessage, userId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
      }
    };
  }, []);

  return {
    localCursor,
    remoteCursors: Object.values(remoteCursors),
    isTracking: isConnected,
  };
}

export default useCollaborationCursors;