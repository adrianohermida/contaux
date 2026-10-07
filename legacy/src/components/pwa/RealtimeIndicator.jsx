/**
 * RealtimeIndicator Component
 * Display WebSocket connection status
 */

import React from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';

export default function RealtimeIndicator({ isConnected = false, isConnecting = false }) {
  const getStatusDisplay = () => {
    if (isConnecting) {
      return {
        icon: Loader,
        text: 'Conectando...',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        dotColor: 'bg-yellow-500 animate-pulse',
      };
    }

    if (isConnected) {
      return {
        icon: Wifi,
        text: 'Conectado',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        dotColor: 'bg-green-500',
      };
    }

    return {
      icon: WifiOff,
      text: 'Desconectado',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      dotColor: 'bg-red-500',
    };
  };

  const status = getStatusDisplay();
  const Icon = status.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor}`}>
      <div className={`w-2 h-2 rounded-full ${status.dotColor}`} />
      <Icon className={`w-4 h-4 ${status.color}`} />
      <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
    </div>
  );
}