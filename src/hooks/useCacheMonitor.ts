
import { useState, useEffect } from 'react';
import { getCacheStats, resetCacheStats } from '@/utils/cacheService';

interface CacheStats {
  memoryCacheCount: number;
  localStorageCount: number;
  sessionStorageCount: number;
  totalCacheEntries: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatio: number;
  compressionSavings: number;
  totalSize: number;
  throttledUpdates: number;
  batchedUpdates: number;
}

/**
 * Hook to monitor cache performance and usage
 */
export const useCacheMonitor = (refreshInterval = 60000) => {
  const [stats, setStats] = useState<CacheStats>({
    memoryCacheCount: 0,
    localStorageCount: 0,
    sessionStorageCount: 0,
    totalCacheEntries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRatio: 0,
    compressionSavings: 0,
    totalSize: 0,
    throttledUpdates: 0,
    batchedUpdates: 0
  });

  useEffect(() => {
    // Initialize from localStorage (if available)
    const storedStats = JSON.parse(localStorage.getItem('cache:stats') || '{}');
    const hits = storedStats.hits || 0;
    const misses = storedStats.misses || 0;
    
    setStats(prev => ({
      ...prev,
      cacheHits: hits,
      cacheMisses: misses,
      cacheHitRatio: hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100),
      compressionSavings: storedStats.compressionSavings || 0,
      totalSize: storedStats.totalSize || 0,
      throttledUpdates: storedStats.throttled || 0,
      batchedUpdates: storedStats.batchedUpdates || 0
    }));

    // Monitor original console.log to track cache hits/misses
    const originalConsoleLog = console.log;
    
    console.log = function(...args) {
      const message = args[0];
      
      if (typeof message === 'string') {
        if (message.includes('Cache hit')) {
          setStats(prev => ({
            ...prev,
            cacheHits: prev.cacheHits + 1,
            cacheHitRatio: Math.round((prev.cacheHits + 1) / (prev.cacheHits + 1 + prev.cacheMisses) * 100)
          }));
        } else if (message.includes('Cache miss')) {
          setStats(prev => ({
            ...prev,
            cacheMisses: prev.cacheMisses + 1,
            cacheHitRatio: Math.round((prev.cacheHits) / (prev.cacheHits + prev.cacheMisses + 1) * 100)
          }));
        } else if (message.includes('batched updates')) {
          setStats(prev => ({
            ...prev,
            batchedUpdates: prev.batchedUpdates + 1
          }));
        } else if (message.includes('throttled')) {
          setStats(prev => ({
            ...prev,
            throttledUpdates: prev.throttledUpdates + 1
          }));
        } else if (message.includes('Cache synced from another tab')) {
          // Update stats for synced items
          setTimeout(() => updateStats(), 100);
        }
      }
      
      originalConsoleLog.apply(console, args);
    };
    
    // Regular update of cache stats
    const updateStats = () => {
      const cacheStats = getCacheStats();
      setStats(prev => ({
        ...prev,
        ...cacheStats
      }));
    };
    
    updateStats();
    const interval = setInterval(updateStats, refreshInterval);
    
    return () => {
      clearInterval(interval);
      console.log = originalConsoleLog;
    };
  }, [refreshInterval]);
  
  return stats;
};
