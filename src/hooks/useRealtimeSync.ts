
import { useState, useEffect, useCallback } from 'react';

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number;
  pendingUpdates: number;
  syncInProgress: boolean;
}

interface UseRealtimeSyncOptions {
  batchInterval?: number;
  syncOnReconnect?: boolean;
  retryInterval?: number;
  maxRetries?: number;
}

export const useRealtimeSync = (options: UseRealtimeSyncOptions = {}) => {
  const {
    batchInterval = 1000,
    syncOnReconnect = true,
    retryInterval = 5000,
    maxRetries = 3
  } = options;
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: Date.now(),
    pendingUpdates: 0,
    syncInProgress: false
  });
  
  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      const prevStatus = {...syncStatus}; // Create a copy of the current status before updating
      
      setSyncStatus(currentStatus => ({
        ...currentStatus,
        isOnline: true
      }));
      
      if (syncOnReconnect && prevStatus.pendingUpdates > 0) {
        forceSyncNow();
      }
    };
    
    const handleOffline = () => {
      setSyncStatus(currentStatus => ({
        ...currentStatus,
        isOnline: false
      }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOnReconnect, syncStatus]);
  
  // Force synchronization of pending updates
  const forceSyncNow = useCallback(() => {
    if (!navigator.onLine || syncStatus.syncInProgress) {
      return;
    }
    
    setSyncStatus(currentStatus => ({
      ...currentStatus,
      syncInProgress: true
    }));
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus(currentStatus => ({
        ...currentStatus,
        pendingUpdates: 0,
        lastSyncTime: Date.now(),
        syncInProgress: false
      }));
    }, 1500);
  }, [syncStatus.syncInProgress]);
  
  return {
    syncStatus,
    forceSyncNow
  };
};
