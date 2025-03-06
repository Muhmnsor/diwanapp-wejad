
import { useEffect } from 'react';
import { 
  initCacheSync, 
  subscribeToCacheSync, 
  cleanupCacheSync 
} from '@/utils/realtimeCacheSync';

/**
 * Hook to initialize and manage realtime cache sync
 */
export const useRealtimeSync = () => {
  useEffect(() => {
    // Initialize cache sync when component mounts
    initCacheSync();
    
    // Cleanup when component unmounts
    return () => {
      cleanupCacheSync();
    };
  }, []);
  
  // Return nothing, this hook is just for setup
  return null;
};

/**
 * Hook to listen for specific cache sync events with a callback
 */
export const useSyncListener = (callback: (event: MessageEvent) => void) => {
  useEffect(() => {
    // Subscribe to cache sync events
    const unsubscribe = subscribeToCacheSync(callback);
    
    // Cleanup subscription when component unmounts
    return unsubscribe;
  }, [callback]);
};
