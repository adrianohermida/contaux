import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Device Tracker - Rastreia informações do dispositivo
 */
export default function DeviceTracker() {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    os: '',
    browser: '',
    screenSize: '',
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const detectDevice = () => {
    const ua = navigator.userAgent;
    const width = window.innerWidth;

    let type = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';
    let isMobile = false;
    let isTablet = false;

    // Detect OS
    if (ua.indexOf('Windows') > -1) os = 'Windows';
    if (ua.indexOf('Mac') > -1) os = 'macOS';
    if (ua.indexOf('Linux') > -1) os = 'Linux';
    if (ua.indexOf('Android') > -1) os = 'Android';
    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

    // Detect Browser
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    if (ua.indexOf('Edge') > -1) browser = 'Edge';

    // Detect Device Type
    if (width < 768) {
      type = 'mobile';
      isMobile = true;
    } else if (width < 1024) {
      type = 'tablet';
      isTablet = true;
    }

    setDeviceInfo({
      type,
      os,
      browser,
      screenSize: `${width}x${window.innerHeight}px`,
      isMobile,
      isTablet,
    });
  };

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="w-8 h-8 text-blue-600" />;
    if (deviceInfo.isTablet) return <Tablet className="w-8 h-8 text-purple-600" />;
    return <Monitor className="w-8 h-8 text-green-600" />;
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4">
          {getDeviceIcon()}
          <div>
            <p className="font-medium capitalize">{deviceInfo.type}</p>
            <p className="text-xs text-gray-600">{deviceInfo.screenSize}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-600">Sistema Operacional</p>
            <p className="font-medium">{deviceInfo.os}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Navegador</p>
            <p className="font-medium">{deviceInfo.browser}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}