
/**
 * Enhanced Realtime Sync Utilities
 * These utilities provide integration with Supabase Realtime for multi-device synchronization
 */

import { nanoid } from 'nanoid';
import { 
  getCacheData, 
  setCacheData, 
  removeCacheData, 
  clearCacheByPrefix,
  CacheStorage, 
  CachePriority,
  RefreshStrategy
} from './cacheService';
import { supabase } from "@/integrations/supabase/client";

// Constants
const SYNC_CHANNEL = 'sync-channel';
const CLIENT_ID = nanoid(); // Generate unique client ID for this browser instance

// Interface for sync messages
interface SyncMessage {
  type: 'set' | 'remove' | 'clear';
  clientId: string;
  key: string;
  storage?: CacheStorage;
  data?: any;
  timestamp: number;
}

// Channel for server sync
let serverChannel: any = null;

/**
 * Initialize sync system with Supabase Realtime
 */
export const initSync = (): void => {
  // Initialize server sync with Supabase Realtime
  try {
    serverChannel = supabase
      .channel('data-sync')
      .on('broadcast', { event: 'sync' }, (payload) => {
        // Ignore our own messages
        if (payload.payload.clientId === CLIENT_ID) return;
        
        // Process server message
        handleSyncMessage(payload.payload as SyncMessage);
      })
      .subscribe((status) => {
        console.log('Server sync channel status:', status);
      });
      
    console.log('Data sync initialized with Supabase Realtime');
  } catch (error) {
    console.error('Failed to initialize server sync channel:', error);
  }
};

/**
 * Broadcast a message to other clients via the server
 */
export const broadcastServerMessage = (message: SyncMessage): void => {
  if (serverChannel) {
    try {
      serverChannel.send({
        type: 'broadcast',
        event: 'sync',
        payload: message
      });
    } catch (error) {
      console.error('Error broadcasting server sync message:', error);
    }
  }
};

/**
 * Handle incoming sync message
 */
const handleSyncMessage = (message: SyncMessage): void => {
  try {
    switch (message.type) {
      case 'set':
        if (message.key && message.data !== undefined) {
          // Apply cache update from another client
          setCacheData(
            message.key, 
            message.data, 
            undefined, // Use default duration
            message.storage || 'memory',
            { 
              useCompression: false, // Don't compress again
              batchUpdate: false // Don't notify (to avoid loops)
            }
          );
          console.log(`Cache updated from sync: ${message.key}`);
        }
        break;
        
      case 'remove':
        if (message.key) {
          // Remove item from cache
          removeCacheData(message.key, message.storage || 'memory');
          console.log(`Cache item removed by sync: ${message.key}`);
        }
        break;
        
      case 'clear':
        if (message.key) {
          // Clear cache items by prefix
          clearCacheByPrefix(message.key);
          console.log(`Cache cleared by prefix: ${message.key}`);
        }
        break;
    }
  } catch (error) {
    console.error('Error processing sync message:', error);
  }
};

/**
 * Notify other clients when cache is updated
 */
export const notifyCacheUpdate = (
  key: string, 
  data: any, 
  storage: CacheStorage = 'memory'
): void => {
  broadcastServerMessage({
    type: 'set',
    clientId: CLIENT_ID,
    key,
    data,
    storage,
    timestamp: Date.now()
  });
};

/**
 * Notify other clients when cache item is removed
 */
export const notifyCacheRemove = (key: string, storage: CacheStorage = 'memory'): void => {
  broadcastServerMessage({
    type: 'remove',
    clientId: CLIENT_ID,
    key,
    storage,
    timestamp: Date.now()
  });
};

/**
 * Notify other clients when cache is cleared by prefix
 */
export const notifyCacheClear = (prefix: string): void => {
  broadcastServerMessage({
    type: 'clear',
    clientId: CLIENT_ID,
    key: prefix,
    timestamp: Date.now()
  });
};

/**
 * Clean up resources
 */
export const cleanupSync = (): void => {
  // Clean up server communication
  if (serverChannel) {
    supabase.removeChannel(serverChannel);
    serverChannel = null;
  }
};
