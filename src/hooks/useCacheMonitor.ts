
import { useState, useEffect } from 'react';
import { getCacheStats, resetCacheStats } from '@/utils/cacheService';

type CacheStats = {
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
};

export const useCacheMonitor = (refreshInterval: number = 5000) => {
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
    // Initial fetch
    fetchStats();

    // Set up interval for refreshing stats
    const intervalId = setInterval(fetchStats, refreshInterval);

    // Clean up
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const fetchStats = () => {
    const freshStats = getCacheStats();
    setStats(freshStats);
  };

  const resetStats = () => {
    resetCacheStats();
    fetchStats(); // Refresh stats after reset
  };

  return stats;
};
