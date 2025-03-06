
import { useEffect, useCallback } from 'react';
import { 
  initCacheSync, 
  subscribeToCacheSync, 
  cleanupCacheSync,
  sendBatchUpdate
} from '@/utils/realtimeCacheSync';

/**
 * Enhanced hook to initialize and manage realtime cache sync
 * with support for batch processing and reconnection handling
 */
export const useRealtimeSync = () => {
  useEffect(() => {
    // Initialize cache sync when component mounts
    initCacheSync();
    
    // Ensure pending updates are sent before user leaves
    const handleBeforeUnload = () => {
      sendBatchUpdate(true);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupCacheSync();
    };
  }, []);
  
  // Return nothing, this hook is just for setup
  return null;
};

/**
 * Enhanced hook to listen for specific cache sync events with a callback
 * Supports intelligent batching and reconnection handling
 */
export const useSyncListener = (callback: (event: MessageEvent) => void) => {
  // Memoize callback to prevent unnecessary re-subscriptions
  const stableCallback = useCallback(callback, [callback]);
  
  useEffect(() => {
    // Subscribe to cache sync events
    const unsubscribe = subscribeToCacheSync(stableCallback);
    
    // Cleanup subscription when component unmounts
    return unsubscribe;
  }, [stableCallback]);
};
