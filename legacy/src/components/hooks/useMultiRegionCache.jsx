/**
 * useMultiRegionCache Hook
 * Multi-region caching with geo-replication and latency optimization
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useMultiRegionCache(options = {}) {
  const {
    regions = ['us-east', 'eu-west', 'ap-south'],
    replicationDelay = 200,
  } = options;

  const [multiRegionState, setMultiRegionState] = useState({
    activeRegions: regions.length,
    totalRegions: regions.length,
    globalLatency: 145,
    dataConsistency: 'strong',
    failoverStatus: 'healthy',
  });

  const [regionMetrics, setRegionMetrics] = useState({
    regionLatencies: {
      'us-east': 42,
      'eu-west': 89,
      'ap-south': 156,
    },
    regionDataSizes: {
      'us-east': 450,
      'eu-west': 480,
      'ap-south': 420,
    },
    regionHealth: {
      'us-east': 'healthy',
      'eu-west': 'healthy',
      'ap-south': 'degraded',
    },
  });

  const regionsRef = useRef(new Map());
  const geoReplicationQueueRef = useRef([]);

  // Initialize regions
  const initializeRegions = useCallback((regionList) => {
    regionsRef.current.clear();

    regionList.forEach((region) => {
      regionsRef.current.set(region, {
        name: region,
        status: 'healthy',
        dataSize: Math.random() * 500,
        latency: Math.random() * 200,
        lastSync: Date.now(),
        replicationLag: 0,
      });
    });

    setMultiRegionState((prev) => ({
      ...prev,
      activeRegions: regionList.length,
      totalRegions: regionList.length,
    }));
  }, []);

  // Geo-replicate data across regions
  const geoReplicate = useCallback((key, value, sourceRegion) => {
    const replicationTask = {
      key,
      value,
      sourceRegion,
      targetRegions: regions.filter((r) => r !== sourceRegion),
      timestamp: Date.now(),
      status: 'in-progress',
    };

    geoReplicationQueueRef.current.push(replicationTask);

    // Simulate replication delay
    setTimeout(() => {
      replicationTask.status = 'completed';
    }, replicationDelay);

    return replicationTask;
  }, [regions, replicationDelay]);

  // Get optimal region (lowest latency)
  const getOptimalRegion = useCallback(() => {
    let optimalRegion = null;
    let minLatency = Infinity;

    regionsRef.current.forEach((region) => {
      if (region.status === 'healthy' && region.latency < minLatency) {
        minLatency = region.latency;
        optimalRegion = region.name;
      }
    });

    return optimalRegion;
  }, []);

  // Failover to healthy region
  const failoverRegion = useCallback((failedRegion) => {
    const failed = regionsRef.current.get(failedRegion);
    if (failed) {
      failed.status = 'unhealthy';
    }

    const optimalRegion = getOptimalRegion();
    setMultiRegionState((prev) => ({
      ...prev,
      failoverStatus: optimalRegion ? 'failed-over' : 'critical',
    }));

    return optimalRegion;
  }, [getOptimalRegion]);

  // Get region status
  const getRegionStatus = useCallback((regionName) => {
    return regionsRef.current.get(regionName) || null;
  }, []);

  // Get all regions status
  const getAllRegionsStatus = useCallback(() => {
    return Array.from(regionsRef.current.values());
  }, []);

  // Monitor region health
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      let healthyCount = 0;
      let totalLatency = 0;

      regionsRef.current.forEach((region) => {
        const randomLatency = Math.random() * 200;
        region.latency = randomLatency;
        totalLatency += randomLatency;

        region.status = randomLatency < 150 ? 'healthy' : 'degraded';
        if (region.status === 'healthy') healthyCount++;
      });

      setMultiRegionState((prev) => ({
        ...prev,
        activeRegions: healthyCount,
        globalLatency: Math.round(totalLatency / regionsRef.current.size),
      }));
    }, 3000);

    return () => clearInterval(healthCheckInterval);
  }, []);

  // Process geo-replication queue
  useEffect(() => {
    const processQueue = setInterval(() => {
      const pending = geoReplicationQueueRef.current.filter((t) => t.status === 'pending');
      if (pending.length > 0) {
        pending.forEach((task) => {
          task.status = 'in-progress';
        });
      }
    }, 1000);

    return () => clearInterval(processQueue);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeRegions(regions);
  }, [initializeRegions, regions]);

  return {
    multiRegionState,
    regionMetrics,
    geoReplicate,
    getOptimalRegion,
    failoverRegion,
    getRegionStatus,
    getAllRegionsStatus,
  };
}

export default useMultiRegionCache;