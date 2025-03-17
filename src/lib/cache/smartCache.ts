
import { QueryClient } from '@tanstack/react-query';
import { DataCategory, getCacheSettings } from './cacheConfig';
import { toast } from 'sonner';

// Cache prefetcher for anticipated user actions
export const prefetchQueries = (
  queryClient: QueryClient, 
  queries: Array<{ 
    queryKey: string[]; 
    category: DataCategory;
    queryFn: () => Promise<any>;
  }>,
  devSettings?: any
) => {
  queries.forEach(({ queryKey, category, queryFn }) => {
    const settings = getCacheSettings(category, devSettings);
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: settings.staleTime,
      gcTime: settings.gcTime
    });
  });
};

// Clear all cache or specific queries
export const clearCache = async (
  queryClient: QueryClient, 
  queryKeys?: string[][]
) => {
  try {
    if (queryKeys) {
      queryKeys.forEach(key => {
        queryClient.removeQueries({ queryKey: key });
      });
      toast.success('تم مسح الذاكرة المؤقتة المحددة بنجاح');
    } else {
      await queryClient.invalidateQueries();
      toast.success('تم مسح الذاكرة المؤقتة بنجاح');
    }
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    toast.error('حدث خطأ أثناء مسح الذاكرة المؤقتة');
    return false;
  }
};

// Function to invalidate related queries
export const invalidateRelatedQueries = (
  queryClient: QueryClient, 
  primaryQueryKey: string[], 
  relatedQueryKeys: string[][]
) => {
  // Invalidate the primary query
  queryClient.invalidateQueries({ queryKey: primaryQueryKey });
  
  // Invalidate all related queries
  relatedQueryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

// Cache metrics tracking
interface CacheMetrics {
  hits: number;
  misses: number;
  lastUpdated: Date;
}

const cacheMetrics: Record<string, CacheMetrics> = {};

export const trackCacheMetrics = (queryKey: string[], isHit: boolean) => {
  const key = queryKey.join('.');
  if (!cacheMetrics[key]) {
    cacheMetrics[key] = { hits: 0, misses: 0, lastUpdated: new Date() };
  }
  
  if (isHit) {
    cacheMetrics[key].hits += 1;
  } else {
    cacheMetrics[key].misses += 1;
  }
  
  cacheMetrics[key].lastUpdated = new Date();
};

export const getCacheMetrics = () => {
  return cacheMetrics;
};

// Browser storage cache layer
export const storeInLocalCache = (key: string, data: any, expiryInMinutes: number) => {
  try {
    const item = {
      data,
      expiry: Date.now() + (expiryInMinutes * 60 * 1000)
    };
    localStorage.setItem(`smart_cache:${key}`, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Error storing in local cache for key ${key}:`, error);
    return false;
  }
};

export const getFromLocalCache = (key: string) => {
  try {
    const itemStr = localStorage.getItem(`smart_cache:${key}`);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(`smart_cache:${key}`);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`Error retrieving from local cache for key ${key}:`, error);
    return null;
  }
};

// Tab synchronization using BroadcastChannel
let broadcastChannel: BroadcastChannel | null = null;

export const initCacheSync = () => {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel('smart_cache_sync');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'INVALIDATE_CACHE' && event.data?.queryKey) {
          const queryClient = new QueryClient();
          queryClient.invalidateQueries({ queryKey: event.data.queryKey });
        }
      };
    } catch (error) {
      console.error('Error initializing cache sync:', error);
    }
  }
};

export const broadcastCacheInvalidation = (queryKey: string[]) => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'INVALIDATE_CACHE',
        queryKey,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error broadcasting cache invalidation:', error);
    }
  }
};
