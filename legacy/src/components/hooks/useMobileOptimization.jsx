/**
 * useMobileOptimization Hook
 * Device capability detection, performance optimization, and mobile-first enhancements
 */

import { useState, useCallback, useEffect } from 'react';

export function useMobileOptimization(options = {}) {
  const { enableAutoOptimize = true } = options;

  const [mobileState, setMobileState] = useState({
    isMobile: false,
    isTablet: false,
    screenSize: 'desktop',
    deviceMemory: 0,
    batteryLevel: 100,
    networkType: '4g',
    cpuCores: 0,
    isLowPowerMode: false,
    orientation: 'portrait',
    touchSupport: false,
  });

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    
    const screenSize = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    
    const deviceMemory = (navigator.deviceMemory || 4);
    const cpuCores = navigator.hardwareConcurrency || 4;
    const touchSupport = () => {
      try {
        document.createEvent('TouchEvent');
        return true;
      } catch (e) {
        return false;
      }
    };

    return {
      isMobile,
      isTablet,
      screenSize,
      deviceMemory,
      cpuCores,
      touchSupport: touchSupport(),
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    };
  }, []);

  // Get battery status
  const getBatteryStatus = useCallback(async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return {
          level: battery.level * 100,
          isLowPowerMode: battery.level < 0.2,
        };
      }
      return { level: 100, isLowPowerMode: false };
    } catch (e) {
      return { level: 100, isLowPowerMode: false };
    }
  }, []);

  // Get network information
  const getNetworkInfo = useCallback(() => {
    try {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        return {
          networkType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
        };
      }
      return { networkType: '4g', downlink: 10, rtt: 50 };
    } catch (e) {
      return { networkType: '4g', downlink: 10, rtt: 50 };
    }
  }, []);

  // Optimize for low-end devices
  const optimizeForLowEndDevice = useCallback(() => {
    if (mobileState.deviceMemory <= 2) {
      return {
        disableAnimations: true,
        reduceQuality: true,
        lazyLoadImages: true,
        compressAssets: true,
      };
    }
    return {
      disableAnimations: false,
      reduceQuality: false,
      lazyLoadImages: true,
      compressAssets: false,
    };
  }, [mobileState.deviceMemory]);

  // Optimize image loading
  const optimizeImageLoading = useCallback((imageUrl, options = {}) => {
    const { maxWidth = 800, quality = 80 } = options;
    
    const isMobileDevice = mobileState.isMobile;
    const isSlowNetwork = mobileState.networkType === 'slow-2g' || mobileState.networkType === '2g';
    
    if (isMobileDevice && isSlowNetwork) {
      return `${imageUrl}?w=${Math.min(maxWidth, 400)}&q=${Math.min(quality, 60)}`;
    }
    
    return `${imageUrl}?w=${maxWidth}&q=${quality}`;
  }, [mobileState.isMobile, mobileState.networkType]);

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    setMobileState(prev => ({
      ...prev,
      orientation,
    }));
  }, []);

  // Get performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = [];
    
    if (mobileState.isMobile) {
      recommendations.push('Enable touch-friendly controls');
      recommendations.push('Optimize font sizes for readability');
    }
    
    if (mobileState.networkType === 'slow-2g' || mobileState.networkType === '2g') {
      recommendations.push('Enable offline caching');
      recommendations.push('Compress assets');
    }
    
    if (mobileState.isLowPowerMode) {
      recommendations.push('Reduce animation complexity');
      recommendations.push('Disable background tasks');
    }
    
    if (mobileState.deviceMemory <= 2) {
      recommendations.push('Implement code splitting');
      recommendations.push('Use service workers for caching');
    }
    
    return recommendations;
  }, [mobileState]);

  // Initialize optimization
  useEffect(() => {
    if (!enableAutoOptimize) return;

    const capabilities = detectDeviceCapabilities();
    
    getBatteryStatus().then(battery => {
      getNetworkInfo();
      
      setMobileState(prev => ({
        ...prev,
        ...capabilities,
        batteryLevel: battery.level,
        isLowPowerMode: battery.isLowPowerMode,
      }));
    });

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', () => {
      const newScreenSize = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
      setMobileState(prev => ({
        ...prev,
        screenSize: newScreenSize,
      }));
    });

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [enableAutoOptimize, detectDeviceCapabilities, getBatteryStatus, getNetworkInfo, handleOrientationChange]);

  return {
    mobileState,
    detectDeviceCapabilities,
    getBatteryStatus,
    getNetworkInfo,
    optimizeForLowEndDevice,
    optimizeImageLoading,
    getPerformanceRecommendations,
    isMobile: mobileState.isMobile,
    isTablet: mobileState.isTablet,
    screenSize: mobileState.screenSize,
  };
}

export default useMobileOptimization;