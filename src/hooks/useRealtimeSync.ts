
import { useEffect, useCallback, useState } from 'react';
import { 
  initCacheSync, 
  subscribeToCacheSync, 
  cleanupCacheSync,
  sendBatchUpdate,
  addToBatch,
  notifyCacheUpdate
} from '@/utils/realtimeCacheSync';

/**
 * Enhanced hook to initialize and manage realtime cache sync
 * with support for batch processing, reconnection handling,
 * and offline mode support
 */
export const useRealtimeSync = (options = { batchInterval: 200, syncOnReconnect: true }) => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    pendingUpdates: 0,
    lastSyncTime: Date.now(),
    isSyncing: false
  });

  // Handle network status changes
  const handleNetworkChange = useCallback(() => {
    const isOnline = navigator.onLine;
    setSyncStatus(prevStatus => ({
      ...prevStatus,
      isOnline
    }));
    
    // If we're back online and have syncOnReconnect enabled, force a sync
    if (isOnline && options.syncOnReconnect) {
      sendBatchUpdate(true);
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        lastSyncTime: Date.now()
      }));
    }
  }, [options.syncOnReconnect]);

  // Track batch updates count
  const updatePendingCount = useCallback((count: number) => {
    setSyncStatus(prevStatus => ({
      ...prevStatus,
      pendingUpdates: count
    }));
  }, []);

  useEffect(() => {
    // Initialize cache sync when component mounts
    initCacheSync();
    
    // Ensure pending updates are sent before user leaves
    const handleBeforeUnload = () => {
      setSyncStatus(prevStatus => ({ ...prevStatus, isSyncing: true }));
      sendBatchUpdate(true);
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        isSyncing: false,
        pendingUpdates: 0,
        lastSyncTime: Date.now()
      }));
    };
    
    // Listen for network changes
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Set up a listener to update the pending updates count
    const unsubscribe = subscribeToCacheSync((event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'batch') {
          updatePendingCount(data.batch?.length || 0);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });
    
    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unsubscribe();
      cleanupCacheSync();
    };
  }, [handleNetworkChange, updatePendingCount]);
  
  // Manually trigger a sync
  const forceSyncNow = useCallback(() => {
    setSyncStatus(prevStatus => ({ ...prevStatus, isSyncing: true }));
    sendBatchUpdate(true);
    setSyncStatus(prevStatus => ({
      ...prevStatus,
      isSyncing: false,
      pendingUpdates: 0,
      lastSyncTime: Date.now()
    }));
  }, []);
  
  // Return sync status and control functions
  return {
    syncStatus,
    forceSyncNow,
    enqueueSyncItem: addToBatch,
    updateCache: notifyCacheUpdate
  };
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
