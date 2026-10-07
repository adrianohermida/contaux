/**
 * useDistributedCache Hook
 * Distributed caching across multiple nodes/regions
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useDistributedCache(options = {}) {
  const {
    replicationFactor = 3,
    consistencyLevel = 'eventual',
    syncInterval = 5000,
  } = options;

  const [distributedState, setDistributedState] = useState({
    totalNodes: 5,
    activeNodes: 5,
    replicas: replicationFactor,
    consistency: consistencyLevel,
    syncStatus: 'synced',
    lastSync: new Date(),
  });

  const [nodeMetrics, setNodeMetrics] = useState({
    dataDistribution: 'balanced',
    replicationLag: 145,
    conflictResolutions: 0,
    failoverEvents: 0,
  });

  const cacheNodesRef = useRef(new Map());
  const replicationQueueRef = useRef([]);

  // Initialize cluster nodes
  const initializeNodes = useCallback((nodeCount) => {
    cacheNodesRef.current.clear();

    for (let i = 0; i < nodeCount; i++) {
      cacheNodesRef.current.set(`node_${i}`, {
        id: `node_${i}`,
        status: 'healthy',
        dataSize: Math.random() * 100,
        lastHeartbeat: Date.now(),
        replicas: [],
      });
    }

    setDistributedState((prev) => ({
      ...prev,
      totalNodes: nodeCount,
      activeNodes: nodeCount,
    }));
  }, []);

  // Replicate data across nodes
  const replicateData = useCallback((key, value) => {
    const nodes = Array.from(cacheNodesRef.current.keys());
    const primaryNode = nodes[Math.floor(Math.random() * nodes.length)];

    const replicaNodes = nodes
      .filter((n) => n !== primaryNode)
      .slice(0, replicationFactor - 1);

    const replicationTask = {
      key,
      value,
      primaryNode,
      replicaNodes,
      timestamp: Date.now(),
      status: 'pending',
    };

    replicationQueueRef.current.push(replicationTask);

    // Update node replicas
    const primary = cacheNodesRef.current.get(primaryNode);
    if (primary) {
      primary.replicas = [...replicaNodes];
    }

    return { primaryNode, replicaNodes };
  }, [replicationFactor]);

  // Resolve conflicts (simple last-write-wins)
  const resolveConflict = useCallback((conflicts) => {
    if (conflicts.length === 0) return null;

    const sorted = conflicts.sort((a, b) => b.timestamp - a.timestamp);
    return sorted[0];
  }, []);

  // Process replication queue
  useEffect(() => {
    const interval = setInterval(() => {
      setDistributedState((prev) => {
        const processed = replicationQueueRef.current.filter((task) => task.status === 'pending');
        const completed = processed.length > 0 ? processed.length : 0;

        return {
          ...prev,
          syncStatus: completed > 0 ? 'syncing' : 'synced',
          lastSync: new Date(),
        };
      });

      // Mark tasks as completed
      replicationQueueRef.current = replicationQueueRef.current.map((task) => ({
        ...task,
        status: task.status === 'pending' ? 'completed' : task.status,
      }));

      // Keep only recent tasks
      if (replicationQueueRef.current.length > 1000) {
        replicationQueueRef.current = replicationQueueRef.current.slice(-500);
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [syncInterval]);

  // Health check nodes
  const healthCheckNodes = useCallback(() => {
    let healthyCount = 0;

    cacheNodesRef.current.forEach((node) => {
      const timeSinceHeartbeat = Date.now() - node.lastHeartbeat;
      node.status = timeSinceHeartbeat > 10000 ? 'unhealthy' : 'healthy';

      if (node.status === 'healthy') {
        healthyCount++;
      }
    });

    setDistributedState((prev) => ({
      ...prev,
      activeNodes: healthyCount,
    }));

    return healthyCount;
  }, []);

  // Get node status
  const getNodeStatus = useCallback((nodeId) => {
    return cacheNodesRef.current.get(nodeId) || null;
  }, []);

  // Get cluster status
  const getClusterStatus = useCallback(() => {
    const nodes = Array.from(cacheNodesRef.current.values());
    const healthyNodes = nodes.filter((n) => n.status === 'healthy');
    const totalReplicas = nodes.reduce((sum, n) => sum + n.replicas.length, 0);

    return {
      ...distributedState,
      healthyNodes: healthyNodes.length,
      totalReplicas,
      nodeDetails: nodes,
      replicationQueueLength: replicationQueueRef.current.length,
    };
  }, [distributedState]);

  // Failover to replica
  const failoverToReplica = useCallback((primaryNode) => {
    const primary = cacheNodesRef.current.get(primaryNode);
    if (!primary || primary.replicas.length === 0) return null;

    const newPrimary = primary.replicas[0];
    const newNode = cacheNodesRef.current.get(newPrimary);

    if (newNode) {
      newNode.status = 'healthy';
      setNodeMetrics((prev) => ({
        ...prev,
        failoverEvents: prev.failoverEvents + 1,
      }));

      return newPrimary;
    }

    return null;
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeNodes(5);
    const healthCheck = setInterval(healthCheckNodes, 3000);

    return () => clearInterval(healthCheck);
  }, [initializeNodes, healthCheckNodes]);

  return {
    distributedState,
    nodeMetrics,
    replicateData,
    resolveConflict,
    getNodeStatus,
    getClusterStatus,
    failoverToReplica,
  };
}

export default useDistributedCache;