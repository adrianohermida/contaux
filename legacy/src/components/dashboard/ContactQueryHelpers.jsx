/**
 * Contact Query Helpers
 * Optimized backend queries for contact management
 */

/**
 * Normalize tag assignments to Map for O(1) lookup
 */
export function normalizeAssignments(assignments) {
  const assignmentMap = new Map();
  assignments.forEach(assignment => {
    if (!assignmentMap.has(assignment.contact_id)) {
      assignmentMap.set(assignment.contact_id, []);
    }
    assignmentMap.get(assignment.contact_id).push(assignment.tag_id);
  });
  return assignmentMap;
}

/**
 * Get tags for a specific contact using normalized map (O(1))
 */
export function getContactTags(contactId, assignmentMap, tagsMap) {
  const tagIds = assignmentMap.get(contactId) || [];
  return tagIds
    .map(tagId => tagsMap.get(tagId))
    .filter(Boolean);
}

/**
 * Create tag lookup map
 */
export function createTagMap(tags) {
  const map = new Map();
  tags.forEach(tag => map.set(tag.id, tag));
  return map;
}

/**
 * Build backend filter query
 */
export function buildContactQuery(workspace_id, filters = {}) {
  const query = { workspace_id };
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.type && filters.type !== 'all') {
    query.client_type = filters.type;
  }
  return query;
}

/**
 * Client-side search filter
 */
export function filterBySearch(contacts, searchTerm) {
  if (!searchTerm) return contacts;
  const term = searchTerm.toLowerCase();
  return contacts.filter(c =>
    (c.company_name && c.company_name.toLowerCase().includes(term)) ||
    (c.email && c.email.toLowerCase().includes(term))
  );
}

/**
 * Sort contacts
 */
export function sortContacts(contacts, sortBy = 'created_date', sortOrder = 'desc') {
  return [...contacts].sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}