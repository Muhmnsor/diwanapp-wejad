
import { useState, useEffect } from 'react';
import { getCacheStats } from '@/utils/cacheService';

interface CacheStats {
  memoryCacheCount: number;
  localStorageCount: number;
  sessionStorageCount: number;
  totalCacheEntries: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatio: number;
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
    cacheHitRatio: 0
  });

  useEffect(() => {
    // Initialize hits and misses counters from localStorage
    const hits = parseInt(localStorage.getItem('cache:hits') || '0', 10);
    const misses = parseInt(localStorage.getItem('cache:misses') || '0', 10);
    
    setStats(prev => ({
      ...prev,
      cacheHits: hits,
      cacheMisses: misses,
      cacheHitRatio: hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100)
    }));

    // Monitor original console.log to track cache hits/misses
    const originalConsoleLog = console.log;
    
    console.log = function(...args) {
      const message = args[0];
      
      if (typeof message === 'string') {
        if (message.includes('Cache hit')) {
          const newHits = stats.cacheHits + 1;
          localStorage.setItem('cache:hits', newHits.toString());
          setStats(prev => ({
            ...prev,
            cacheHits: newHits,
            cacheHitRatio: Math.round((newHits / (newHits + prev.cacheMisses)) * 100)
          }));
        } else if (message.includes('Cache miss')) {
          const newMisses = stats.cacheMisses + 1;
          localStorage.setItem('cache:misses', newMisses.toString());
          setStats(prev => ({
            ...prev,
            cacheMisses: newMisses,
            cacheHitRatio: Math.round((prev.cacheHits / (prev.cacheHits + newMisses)) * 100)
          }));
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
