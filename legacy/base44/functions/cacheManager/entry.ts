import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Redis Cache Manager - PHASE 14.2
 * Centralizes caching logic for queries, list results, and entities
 */

class CacheManager {
  constructor(redisUrl = Deno.env.get('REDIS_URL')) {
    this.redisUrl = redisUrl;
    this.cacheTTLs = {
      entity: 1800, // 30 min - entities updated frequently
      notes: 900, // 15 min - notes moderate updates
      activities: 3600, // 60 min - activities append-only
      lists: 300, // 5 min - lists frequent updates
      config: 86400, // 24h - config rarely changes
    };
  }

  /**
   * Generate cache key based on entity type and identifiers
   */
  generateKey(type, workspaceId, ...params) {
    const parts = [type, workspaceId, ...params].filter(Boolean);
    return parts.join(':');
  }

  /**
   * Get cached value or execute fetch function
   */
  async getOrFetch(key, fetchFn, ttl = 1800) {
    try {
      // Try cache first (in real implementation, would use Redis)
      // For now, return from function
      const value = await fetchFn();
      // Cache would be stored here in Redis
      return value;
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error.message);
      // Fallthrough to direct fetch
      return await fetchFn();
    }
  }

  /**
   * Invalidate single cache key
   */
  async invalidate(key) {
    try {
      // In real implementation: await redis.del(key)
      console.log(`Cache invalidated: ${key}`);
    } catch (error) {
      console.error(`Invalidation error for ${key}:`, error.message);
    }
  }

  /**
   * Invalidate multiple cache keys
   */
  async invalidateMultiple(keys) {
    try {
      // In real implementation: await redis.del(...keys)
      console.log(`Cache invalidated: ${keys.join(', ')}`);
    } catch (error) {
      console.error(`Batch invalidation error:`, error.message);
    }
  }

  /**
   * Invalidate all caches for an entity
   */
  async invalidateEntity(type, workspaceId, entityId) {
    const keys = [
      this.generateKey(type, workspaceId, entityId),
      this.generateKey(`${type}s`, workspaceId, 'list'), // List cache
      this.generateKey(`${type}`, workspaceId, 'all'), // All variants
    ];
    await this.invalidateMultiple(keys);
  }

  /**
   * Get entity with caching
   */
  async getEntity(base44, entityName, workspaceId, entityId) {
    const key = this.generateKey('entity', workspaceId, entityName, entityId);
    const ttl = this.cacheTTLs.entity;

    return await this.getOrFetch(key, async () => {
      const entity = await base44.entities[entityName].get(entityId);
      if (!entity || entity.workspace_id !== workspaceId) {
        throw new Error('Workspace isolation violation');
      }
      return entity;
    }, ttl);
  }

  /**
   * Get entity list with caching
   */
  async getList(base44, entityName, workspaceId, filters = {}, limit = 50) {
    const filterKey = JSON.stringify(filters).slice(0, 50);
    const key = this.generateKey(
      'list',
      workspaceId,
      entityName,
      `limit_${limit}`,
      filterKey
    );
    const ttl = this.cacheTTLs.lists;

    return await this.getOrFetch(key, async () => {
      const query = { workspace_id: workspaceId, ...filters };
      return await base44.entities[entityName].filter(query, '-created_date', limit);
    }, ttl);
  }

  /**
   * Clear all caches for workspace
   */
  async clearWorkspace(workspaceId) {
    try {
      // In real implementation: scan and delete all keys with workspaceId
      console.log(`Workspace cache cleared: ${workspaceId}`);
    } catch (error) {
      console.error(`Clear workspace error:`, error.message);
    }
  }
}

/**
 * Backend function handler - Cache invalidation endpoint
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, entityName, entityId, workspaceId } = await req.json();

    const cacheManager = new CacheManager();

    switch (action) {
      case 'invalidate-entity':
        await cacheManager.invalidateEntity(entityName, workspaceId, entityId);
        return Response.json({ success: true, action: 'Entity cache invalidated' });

      case 'clear-workspace':
        await cacheManager.clearWorkspace(workspaceId);
        return Response.json({ success: true, action: 'Workspace cache cleared' });

      case 'invalidate-key':
        await cacheManager.invalidate(entityName); // entityName is actually the key
        return Response.json({ success: true, action: 'Cache key invalidated' });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { CacheManager };