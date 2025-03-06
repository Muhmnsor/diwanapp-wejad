
/**
 * Enhanced Realtime Cache Synchronization
 * Provides WebSocket-based cache synchronization between tabs/windows
 * with advanced features like reconnection, batching, and conflict resolution
 */

import { nanoid } from 'nanoid';
import { getCacheData, setCacheData, removeCacheData, CacheStorage } from './cacheService';

// Constants
const SYNC_CHANNEL = 'cache-sync-channel';
const CLIENT_ID = nanoid(); // Generate unique client ID for this browser instance
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds

// Event types
export type SyncEventType = 'set' | 'remove' | 'clear' | 'ping' | 'batch';

// Interface for sync messages
interface SyncMessage {
  type: SyncEventType;
  clientId: string;
  key?: string;
  storage?: CacheStorage;
  data?: any;
  timestamp: number;
  // Batch updates support
  batch?: {
    operations: Array<{
      type: 'set' | 'remove';
      key: string;
      data?: any;
      storage?: CacheStorage;
    }>;
  };
  // Conflict resolution
  version?: number;
}

// Subscribers
type SyncCallback = (event: MessageEvent) => void;
const subscribers: SyncCallback[] = [];

// BroadcastChannel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;
let webSocketConnection: WebSocket | null = null;
let reconnectAttempts = 0;
let isOnline = navigator.onLine;

// Pending operations during offline mode
const pendingOperations: SyncMessage[] = [];

// Version tracking for conflict resolution
const keyVersions: Record<string, number> = {};

/**
 * Initialize sync system with both BroadcastChannel and WebSocket
 */
export const initCacheSync = (): void => {
  // Initialize BroadcastChannel for cross-tab communication
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
      
      // Listen for messages from other tabs/windows
      broadcastChannel.onmessage = (event: MessageEvent) => {
        const message = event.data as SyncMessage;
        
        // Ignore our own messages
        if (message.clientId === CLIENT_ID) return;
        
        // Process message
        handleSyncMessage(message);
        
        // Notify subscribers
        subscribers.forEach(callback => callback(event));
      };
      
      console.log('Cache sync initialized with BroadcastChannel');
    } catch (error) {
      console.error('Failed to initialize BroadcastChannel for cache sync:', error);
    }
  } else {
    console.warn('BroadcastChannel not supported in this browser. Cache sync limited to current tab.');
  }
  
  // Initialize WebSocket connection for cross-device synchronization
  initWebSocketConnection();
  
  // Listen for online/offline events
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);
  
  // Send ping to announce our presence
  broadcastMessage({
    type: 'ping',
    clientId: CLIENT_ID,
    timestamp: Date.now()
  });
};

/**
 * Initialize WebSocket connection
 */
const initWebSocketConnection = (): void => {
  if (!navigator.onLine) {
    console.log('Currently offline. WebSocket connection will be established when online.');
    return;
  }
  
  try {
    // Use URL from config (simplified for this example)
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/cache-sync`;
    webSocketConnection = new WebSocket(wsUrl);
    
    webSocketConnection.onopen = () => {
      console.log('WebSocket connection established for cache sync');
      reconnectAttempts = 0;
      
      // Process any pending operations
      if (pendingOperations.length > 0) {
        console.log(`Processing ${pendingOperations.length} pending operations`);
        // Group operations into batches
        const batchedMessage: SyncMessage = {
          type: 'batch',
          clientId: CLIENT_ID,
          timestamp: Date.now(),
          batch: {
            operations: pendingOperations.map(op => ({
              type: op.type as 'set' | 'remove',
              key: op.key!,
              data: op.data,
              storage: op.storage
            }))
          }
        };
        
        webSocketConnection?.send(JSON.stringify(batchedMessage));
        pendingOperations.length = 0; // Clear pending operations
      }
    };
    
    webSocketConnection.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as SyncMessage;
        
        // Ignore our own messages
        if (message.clientId === CLIENT_ID) return;
        
        // Process message
        handleSyncMessage(message);
        
        // Notify subscribers
        subscribers.forEach(callback => callback(event));
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    webSocketConnection.onclose = () => {
      console.log('WebSocket connection closed for cache sync');
      webSocketConnection = null;
      
      // Attempt to reconnect if online
      if (navigator.onLine && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * reconnectAttempts;
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(initWebSocketConnection, delay);
      }
    };
    
    webSocketConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to initialize WebSocket for cache sync:', error);
  }
};

/**
 * Handle online/offline status changes
 */
const handleOnlineStatusChange = (): void => {
  const wasOnline = isOnline;
  isOnline = navigator.onLine;
  
  if (!wasOnline && isOnline) {
    console.log('Network connection restored. Reconnecting cache sync...');
    // Reinitialize WebSocket connection
    if (!webSocketConnection) {
      reconnectAttempts = 0;
      initWebSocketConnection();
    }
  } else if (wasOnline && !isOnline) {
    console.log('Network connection lost. Switching to offline mode...');
    // WebSocket will auto-close on disconnect
  }
};

/**
 * Broadcast a message to other tabs/windows and via WebSocket
 */
export const broadcastMessage = (message: SyncMessage): void => {
  // Add version for conflict resolution
  if (message.key && (message.type === 'set' || message.type === 'remove')) {
    const currentVersion = keyVersions[message.key] || 0;
    keyVersions[message.key] = currentVersion + 1;
    message.version = keyVersions[message.key];
  }
  
  // Try to send via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (error) {
      console.error('Error broadcasting cache sync message via BroadcastChannel:', error);
    }
  }
  
  // Try to send via WebSocket
  if (webSocketConnection && webSocketConnection.readyState === WebSocket.OPEN) {
    try {
      webSocketConnection.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error broadcasting cache sync message via WebSocket:', error);
    }
  } else if (!isOnline) {
    // If offline, queue the operation for later
    console.log('Currently offline. Operation queued for later sync.');
    pendingOperations.push(message);
  }
};

/**
 * Handle incoming sync message
 */
const handleSyncMessage = (message: SyncMessage): void => {
  // Skip if it's just a ping
  if (message.type === 'ping') return;
  
  try {
    if (message.type === 'batch' && message.batch) {
      // Process batch operations
      message.batch.operations.forEach(operation => {
        const batchMessage: SyncMessage = {
          type: operation.type,
          clientId: message.clientId,
          key: operation.key,
          data: operation.data,
          storage: operation.storage,
          timestamp: message.timestamp,
          version: message.version
        };
        processSyncOperation(batchMessage);
      });
    } else {
      // Process individual operation
      processSyncOperation(message);
    }
  } catch (error) {
    console.error('Error processing sync message:', error);
  }
};

/**
 * Process a single sync operation
 */
const processSyncOperation = (message: SyncMessage): void => {
  // Skip operations with older versions
  if (
    message.key && 
    message.version && 
    keyVersions[message.key] && 
    message.version < keyVersions[message.key]
  ) {
    console.log(`Skipping outdated operation for ${message.key} (version ${message.version} < ${keyVersions[message.key]})`);
    return;
  }
  
  // Update local version
  if (message.key && message.version) {
    keyVersions[message.key] = message.version;
  }
  
  switch (message.type) {
    case 'set':
      if (message.key && message.data) {
        // Apply cache update
        setCacheData(
          message.key, 
          message.data, 
          undefined, // Use default duration
          message.storage || 'memory',
          { 
            useCompression: false, // Don't compress again
            notifySync: false // Prevent sync loop
          }
        );
        console.log(`Cache synced: ${message.key}`);
      }
      break;
      
    case 'remove':
      if (message.key) {
        // Remove item from cache
        removeCacheData(message.key, false); // false = don't notify others
        console.log(`Cache item removed by sync: ${message.key}`);
      }
      break;
      
    case 'clear':
      if (message.key) {
        // Clear cache items by prefix
        const itemsToRemove = Object.keys(localStorage).filter(key => key.startsWith(message.key!));
        itemsToRemove.forEach(key => removeCacheData(key, false));
        console.log(`Cache cleared by prefix: ${message.key} (${itemsToRemove.length} items)`);
      }
      break;
  }
};

/**
 * Notify other tabs/devices when cache is updated
 */
export const notifyCacheUpdate = (
  key: string, 
  data: any, 
  storage: CacheStorage = 'memory'
): void => {
  broadcastMessage({
    type: 'set',
    clientId: CLIENT_ID,
    key,
    data,
    storage,
    timestamp: Date.now()
  });
};

/**
 * Notify other tabs/devices when cache item is removed
 */
export const notifyCacheRemove = (key: string): void => {
  broadcastMessage({
    type: 'remove',
    clientId: CLIENT_ID,
    key,
    timestamp: Date.now()
  });
};

/**
 * Notify other tabs/devices when cache is cleared by prefix
 */
export const notifyCacheClear = (prefix: string): void => {
  broadcastMessage({
    type: 'clear',
    clientId: CLIENT_ID,
    key: prefix,
    timestamp: Date.now()
  });
};

/**
 * Send a batch update to reduce message volume
 */
export const batchCacheUpdates = (
  operations: Array<{
    type: 'set' | 'remove';
    key: string;
    data?: any;
    storage?: CacheStorage;
  }>
): void => {
  broadcastMessage({
    type: 'batch',
    clientId: CLIENT_ID,
    timestamp: Date.now(),
    batch: {
      operations
    }
  });
};

/**
 * Subscribe to sync events
 */
export const subscribeToCacheSync = (callback: SyncCallback): () => void => {
  subscribers.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
};

/**
 * Clean up resources
 */
export const cleanupCacheSync = (): void => {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
  
  if (webSocketConnection) {
    webSocketConnection.close();
    webSocketConnection = null;
  }
  
  window.removeEventListener('online', handleOnlineStatusChange);
  window.removeEventListener('offline', handleOnlineStatusChange);
};

/**
 * Force sync all local cache with other devices
 */
export const forceSyncAllCache = (): void => {
  // Get all cache keys from localStorage
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('query:') || key.startsWith('cache:')
  );
  
  console.log(`Force syncing ${keys.length} cache items`);
  
  // Group operations into batches of 10 to avoid flooding
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const operations = batch.map(key => {
      try {
        const value = localStorage.getItem(key);
        const data = value ? JSON.parse(value) : null;
        
        return {
          type: 'set' as const,
          key,
          data: data?.data || data,
          storage: 'local' as CacheStorage
        };
      } catch (e) {
        console.warn(`Error processing cache item ${key}:`, e);
        return null;
      }
    }).filter(Boolean);
    
    if (operations.length > 0) {
      setTimeout(() => {
        batchCacheUpdates(operations as any[]);
      }, i * 100); // Stagger the batches
    }
  }
};

/**
 * Check if sync is working properly
 */
export const checkSyncStatus = (): {
  broadcastChannelActive: boolean;
  webSocketActive: boolean;
  isOnline: boolean;
  pendingOperationsCount: number;
} => {
  return {
    broadcastChannelActive: !!broadcastChannel,
    webSocketActive: !!(webSocketConnection && webSocketConnection.readyState === WebSocket.OPEN),
    isOnline,
    pendingOperationsCount: pendingOperations.length
  };
};
