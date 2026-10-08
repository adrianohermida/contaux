import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Cache Manager - Gerencia cache com LRU e TTL
 */
export default function CacheManager() {
  const [cache, setCache] = useState(() => {
    const stored = localStorage.getItem('appCache') || '{}';
    return JSON.parse(stored);
  });
  const [stats, setStats] = useState({ hits: 0, misses: 0, size: 0 });
  const MAX_CACHE_SIZE = 50; // items
  const DEFAULT_TTL = 3600; // 1 hora

  useEffect(() => {
    updateStats();
  }, [cache]);

  const updateStats = () => {
    const cacheSize = Object.keys(cache).length;
    const hitRate = cache.hits || 0;
    const missRate = cache.misses || 0;

    // Calcular tamanho aproximado em KB
    const cacheStr = JSON.stringify(cache);
    const sizeKB = new Blob([cacheStr]).size / 1024;

    setStats({
      hits: hitRate,
      misses: missRate,
      size: sizeKB.toFixed(2),
    });
  };

  const set = (key, value, ttl = DEFAULT_TTL) => {
    const now = Date.now();
    const newCache = { ...cache };

    // LRU: remover item mais antigo se limite atingido
    if (Object.keys(newCache).length >= MAX_CACHE_SIZE) {
      const oldestKey = Object.entries(newCache).sort(
        (a, b) => a[1].lastAccess - b[1].lastAccess
      )[0][0];
      delete newCache[oldestKey];
    }

    newCache[key] = {
      value,
      expires: now + ttl * 1000,
      created: now,
      lastAccess: now,
      accessCount: 0,
    };

    setCache(newCache);
    localStorage.setItem('appCache', JSON.stringify(newCache));
  };

  const get = (key) => {
    const item = cache[key];
    if (!item) {
      setCache(prev => ({ ...prev, misses: (prev.misses || 0) + 1 }));
      return null;
    }

    // Verificar TTL
    if (Date.now() > item.expires) {
      delete cache[key];
      localStorage.setItem('appCache', JSON.stringify(cache));
      return null;
    }

    // Atualizar acesso
    item.lastAccess = Date.now();
    item.accessCount = (item.accessCount || 0) + 1;
    setCache({ ...cache });
    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));

    return item.value;
  };

  const clearExpired = () => {
    const now = Date.now();
    const filtered = Object.entries(cache).reduce((acc, [key, val]) => {
      if (now < val.expires) {
        acc[key] = val;
      }
      return acc;
    }, {});

    setCache(filtered);
    localStorage.setItem('appCache', JSON.stringify(filtered));
  };

  const clearAll = () => {
    setCache({});
    localStorage.removeItem('appCache');
  };

  const hitRate = stats.hits + stats.misses > 0
    ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
    : 0;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Hits</p>
          <p className="text-xl md:text-2xl font-bold text-blue-900">{stats.hits}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Misses</p>
          <p className="text-xl md:text-2xl font-bold text-amber-900">{stats.misses}</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <p className="text-xs text-emerald-600 font-semibold">Hit Rate</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-900">{hitRate}%</p>
        </Card>
        <Card className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Tamanho</p>
          <p className="text-xl md:text-2xl font-bold text-blue-900">{stats.size}KB</p>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={clearExpired} variant="outline" size="sm" className="text-xs">
          <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Limpar Expirados</span>
          <span className="sm:hidden">Expirados</span>
        </Button>
        <Button onClick={clearAll} variant="outline" size="sm" className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50">
          <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Limpar Tudo</span>
          <span className="sm:hidden">Tudo</span>
        </Button>
      </div>

      <Card className="p-3 md:p-4 border-blue-200">
        <h3 className="font-semibold text-sm md:text-base text-blue-900 mb-2 md:mb-3">Items em Cache ({Object.keys(cache).length})</h3>
        <div className="space-y-1 md:space-y-2 max-h-96 overflow-y-auto">
          {Object.entries(cache).length === 0 ? (
            <p className="text-center text-slate-500 py-3 md:py-4 text-sm">Cache vazio</p>
          ) : (
            Object.entries(cache).map(([key, val]) => (
              <div key={key} className="p-2 md:p-3 bg-blue-50 rounded text-xs md:text-sm border border-blue-100">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="font-mono font-bold text-xs break-all text-slate-900">{key}</p>
                  <span className="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded flex-shrink-0">
                    {val.accessCount}x
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Exp: {new Date(val.expires).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}