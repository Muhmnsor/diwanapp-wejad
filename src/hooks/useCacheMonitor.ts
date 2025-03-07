
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
  refreshedEntries: number;
  priorityDistribution: Record<string, number>;
  avgResponseTime: number;
  offlineUpdatesQueued: number;
  syncStatus: string;
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
    batchedUpdates: 0,
    refreshedEntries: 0,
    priorityDistribution: { low: 0, normal: 0, high: 0, critical: 0 },
    avgResponseTime: 0,
    offlineUpdatesQueued: 0,
    syncStatus: 'online'
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
    const freshStats = getCacheStats() as Partial<CacheStats>;
    setStats(prevStats => ({
      ...prevStats,
      ...freshStats,
      // Keep additional stats that might not be in cacheService yet
      refreshedEntries: freshStats.refreshedEntries || prevStats.refreshedEntries || 0,
      priorityDistribution: freshStats.priorityDistribution || prevStats.priorityDistribution,
      avgResponseTime: freshStats.avgResponseTime || prevStats.avgResponseTime || 0,
      offlineUpdatesQueued: freshStats.offlineUpdatesQueued || (window.navigator.onLine ? 0 : (prevStats.offlineUpdatesQueued || 0)),
      syncStatus: window.navigator.onLine ? 'online' : 'offline'
    }));
  };

  const resetStats = () => {
    resetCacheStats();
    fetchStats(); // Refresh stats after reset
  };

  return {
    ...stats,
    resetStats,
    refreshStats: fetchStats
  };
};
