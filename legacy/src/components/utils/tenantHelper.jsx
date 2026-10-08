import { base44 } from '@/api/base44Client';

/**
 * Gets the current user's tenant ID
 * Tenant ID is the user's email for single-user orgs, or a custom ID for multi-user orgs
 */
export async function getCurrentTenantId() {
  try {
    const user = await base44.auth.me();
    // Use email as tenant identifier for now
    // Can be extended to support custom tenant_id field on User entity
    return user?.email || null;
  } catch {
    return null;
  }
}

/**
 * Filters data by current tenant
 * @param {Array} data - Array of entities
 * @param {String} tenantId - Current tenant ID
 * @returns {Array} Filtered data
 */
export function filterByTenant(data, tenantId) {
  if (!Array.isArray(data) || !tenantId) return [];
  return data.filter(item => item.tenant_id === tenantId);
}

/**
 * Lists entities with tenant isolation
 * @param {Function} listFn - Entity list function (e.g., base44.entities.Client.list)
 * @param {String} tenantId - Current tenant ID
 * @returns {Promise<Array>} Filtered entities
 */
export async function listWithTenant(listFn, tenantId) {
  if (!tenantId) return [];
  const query = { tenant_id: tenantId };
  return await listFn(query);
}

/**
 * Creates an entity with tenant ID
 * @param {Function} createFn - Entity create function
 * @param {Object} data - Entity data
 * @param {String} tenantId - Current tenant ID
 * @returns {Promise<Object>} Created entity
 */
export async function createWithTenant(createFn, data, tenantId) {
  return await createFn({ ...data, tenant_id: tenantId });
}