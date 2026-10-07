# React Query Cache Optimization Guide

## Overview
This guide documents the cache optimization strategy implemented in Sprint 22, Task 2.2. All queries now use standardized cache configurations to reduce API calls by approximately 20%.

## Cache Presets

### 1. CRITICAL (5min stale / 15min gc)
**Use for:** Real-time business data that changes frequently
- Contacts, Invoices, Payments, Quotes, Sales Opportunities
- 3 retry attempts with exponential backoff
- Fast invalidation on mutations

**Example:**
```javascript
import { getCacheConfig } from '@/hooks/useQueryCacheConfig';

const { data: contacts } = useQuery({
  queryKey: ['contacts', workspaceId],
  queryFn: fetchContacts,
  ...getCacheConfig('critical')
});
```

### 2. LONG (30min stale / 1h gc)
**Use for:** Semi-static data updated occasionally
- Tags, Categories, Client Lists, Settings
- 1 retry attempt
- Longer cache window for better performance

**Example:**
```javascript
const { data: tags } = useQuery({
  queryKey: ['contact-tags', workspaceId],
  queryFn: fetchTags,
  ...getCacheConfig('long')
});
```

### 3. SHORT (2min stale / 5min gc)
**Use for:** Frequently changing reference data
- Real-time counters, status indicators
- Minimal retry logic
- Quick garbage collection

**Example:**
```javascript
const { data: stats } = useQuery({
  queryKey: ['dashboard-stats', workspaceId],
  queryFn: fetchStats,
  ...getCacheConfig('short')
});
```

### 4. STATIC (Never stale / 1h gc)
**Use for:** Completely immutable data
- Lookup tables, Constants, Configurations
- No retries (fails fast if error)
- Very long cache window

**Example:**
```javascript
const { data: currencies } = useQuery({
  queryKey: ['currencies'],
  queryFn: fetchCurrencies,
  ...getCacheConfig('static')
});
```

## Implementation Strategy

### Pages & Components Updated

1. **pages/Contact.jsx**
   - Contacts query: CRITICAL ✅
   - Tags query: LONG ✅
   - Assignments query: LONG ✅

2. **components/dashboard/InvoiceList.jsx**
   - Invoices query: CRITICAL ✅

3. **components/dashboard/QuoteList.jsx**
   - Quotes query: CRITICAL ✅
   - Clients query: LONG ✅

4. **components/dashboard/PaymentList.jsx**
   - Payments query: CRITICAL ✅
   - Invoices (reference): LONG ✅

## Performance Impact

### Before Optimization
- Contact list: 4 API calls per session
- Invoice list: 2 API calls per session
- Quote list: 2 API calls per session
- **Average reduction goal:** 20% fewer requests

### After Optimization
- Automatic cache reuse
- Smart invalidation
- Reduced server load
- Faster page transitions

## Cache Invalidation Strategy

### Automatic Invalidation (Entity Mutations)
When a record is created, updated, or deleted, related queries are invalidated:

```javascript
// After creating a contact
queryClient.invalidateQueries({ queryKey: ['contacts'] });

// Cascade invalidation for related data
invalidateRelated('contacts', contactId);
```

### Manual Invalidation (When Needed)
```javascript
// Immediate refresh
queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] });

// Soft refetch (don't mark as stale)
refetch();
```

## Hooks for Cache Management

### useQueryCacheOptimizer
```javascript
const { invalidateRelated, getCacheMetrics } = useQueryCacheOptimizer();

// Invalidate related queries
invalidateRelated('contacts', contactId);

// Get cache performance metrics
const metrics = getCacheMetrics();
console.log(metrics); // { totalQueries, activeQueries, stalQueries, ... }
```

### useQueryCacheReport
```javascript
const { getReport, getCacheHitRate } = useQueryCacheReport();

// Generate detailed report
const report = getReport();
console.log(`Cache hit rate: ${report.cacheHitRate.toFixed(2)}%`);

// Monitor cache in real-time
useEffect(() => {
  const cleanup = startMonitoring();
  return cleanup;
}, []);
```

## Best Practices

### 1. Choose the Right Preset
- Always use CRITICAL for user-facing business data
- Use LONG for reference data that rarely changes
- Use SHORT only for real-time counters/stats
- Use STATIC for truly immutable data

### 2. Organize Query Keys
```javascript
// Good structure
['contacts', workspaceId, { filter: 'active' }]
['invoices', workspaceId, status]

// Avoid
['data']
['all-contacts']
```

### 3. Handle Real-time Updates
```javascript
// Subscribe to entity changes
useEffect(() => {
  const unsubscribe = base44.entities.Contact.subscribe(event => {
    if (event.data?.workspace_id === workspaceId) {
      queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] });
    }
  });
  return unsubscribe;
}, [workspaceId, queryClient]);
```

### 4. Prefetch When Possible
```javascript
// Prefetch data before navigation
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['contact-details', contactId],
    queryFn: () => fetchContactDetails(contactId),
    staleTime: 10 * 60 * 1000,
  });
};
```

## Monitoring & Debugging

### Enable Query DevTools
```javascript
// Already configured in Layout.jsx
<ReactQueryDevtools initialIsOpen={false} />
```

### Check Cache Status
```javascript
// In browser console
window.__CACHE_METRICS__ = () => {
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryCache();
  return {
    queries: cache.getAll().length,
    active: cache.getAll().filter(q => q.getObserversCount() > 0).length,
  };
};
```

## Performance Goals

| Metric | Target | Status |
|--------|--------|--------|
| API calls reduction | 20% | 🔄 Monitoring |
| Cache hit rate | 70%+ | 🔄 Monitoring |
| Query response time | <500ms | ✅ Baseline |
| Cache memory usage | <10MB | ✅ Within limits |

## Future Optimizations

1. **Implement cache persistence** (localStorage/IndexedDB)
2. **Add background sync** for offline data
3. **Implement query deduplication** for duplicate requests
4. **Add automatic cache warming** on app startup
5. **Monitor real-time cache metrics** in dashboard

## References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Cache Configuration Best Practices](https://tanstack.com/query/latest/docs/react/important-defaults)
- [Query Key Factory Pattern](https://tanstack.com/query/latest/docs/react/query-keys)