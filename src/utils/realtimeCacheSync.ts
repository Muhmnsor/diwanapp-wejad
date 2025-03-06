
/**
 * Realtime Cache Synchronization
 * Provides WebSocket-based cache synchronization between tabs/windows
 */

import { nanoid } from 'nanoid';
import { getCacheData, setCacheData, removeCacheData, CacheStorage } from './cacheService';

// Constants
const SYNC_CHANNEL = 'cache-sync-channel';
const CLIENT_ID = nanoid(); // Generate unique client ID for this browser instance

// Event types
export type SyncEventType = 'set' | 'remove' | 'clear' | 'ping';

// Interface for sync messages
interface SyncMessage {
  type: SyncEventType;
  clientId: string;
  key?: string;
  storage?: CacheStorage;
  data?: any;
  timestamp: number;
}

// Subscribers
type SyncCallback = (event: MessageEvent) => void;
const subscribers: SyncCallback[] = [];

// BroadcastChannel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;

/**
 * Initialize sync system
 */
export const initCacheSync = (): void => {
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
      
      // Send ping to announce our presence
      broadcastMessage({
        type: 'ping',
        clientId: CLIENT_ID,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to initialize BroadcastChannel for cache sync:', error);
    }
  } else {
    // Fallback for browsers that don't support BroadcastChannel
    console.warn('BroadcastChannel not supported in this browser. Cache sync limited to current tab.');
  }
};

/**
 * Broadcast a message to other tabs/windows
 */
export const broadcastMessage = (message: SyncMessage): void => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (error) {
      console.error('Error broadcasting cache sync message:', error);
    }
  }
};

/**
 * Handle incoming sync message
 */
const handleSyncMessage = (message: SyncMessage): void => {
  // Skip if it's just a ping
  if (message.type === 'ping') return;
  
  try {
    switch (message.type) {
      case 'set':
        if (message.key && message.data) {
          // Apply cache update from another tab
          setCacheData(
            message.key, 
            message.data, 
            undefined, // Use default duration
            message.storage || 'memory',
            { useCompression: false } // Don't compress again
          );
          console.log(`Cache synced from another tab: ${message.key}`);
        }
        break;
        
      case 'remove':
        if (message.key) {
          // Remove item from cache
          removeCacheData(message.key);
          console.log(`Cache item removed by sync: ${message.key}`);
        }
        break;
        
      case 'clear':
        if (message.key) {
          // Clear cache items by prefix
          removeCacheData(message.key);
          console.log(`Cache cleared by prefix: ${message.key}`);
        }
        break;
    }
  } catch (error) {
    console.error('Error processing sync message:', error);
  }
};

/**
 * Notify other tabs when cache is updated
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
 * Notify other tabs when cache item is removed
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
 * Notify other tabs when cache is cleared by prefix
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
};
