/**
 * Enhanced Realtime Cache Synchronization
 * Provides WebSocket-based cache synchronization between tabs/windows and server
 */

import { nanoid } from 'nanoid';
import { getCacheData, setCacheData, removeCacheData, CacheStorage } from './cacheService';
import { supabase } from "@/integrations/supabase/client";

// Constants
const SYNC_CHANNEL = 'cache-sync-channel';
const CLIENT_ID = nanoid(); // Generate unique client ID for this browser instance
const RECONNECT_DELAY = 3000; // Reconnection delay in ms
const MAX_BATCH_SIZE = 20; // Maximum number of updates to process in a batch

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
  batch?: BatchItem[];
}

// Interface for batch item
interface BatchItem {
  type: 'set' | 'remove' | 'clear';
  key: string;
  data?: any;
  storage?: CacheStorage;
}

// Subscribers
type SyncCallback = (event: MessageEvent) => void;
const subscribers: SyncCallback[] = [];

// BroadcastChannel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;

// WebSocket channel for server sync
let serverChannel: any = null;

// Network status tracking
let isOnline = navigator.onLine;
let pendingUpdates: BatchItem[] = [];
let batchUpdateTimeout: number | null = null;
const BATCH_DELAY = 200; // ms to wait before sending a batch

/**
 * Initialize sync system with support for both cross-tab and server sync
 */
export const initCacheSync = (): void => {
  // Initialize cross-tab sync with BroadcastChannel
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

  // Initialize server sync with Supabase Realtime
  try {
    serverChannel = supabase
      .channel('cache-sync')
      .on('broadcast', { event: 'sync' }, (payload) => {
        // Ignore our own messages
        if (payload.payload.clientId === CLIENT_ID) return;
        
        // Process server message
        handleSyncMessage(payload.payload as SyncMessage);
      })
      .subscribe((status) => {
        console.log('Server sync channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          // Send ping to announce our presence
          broadcastServerMessage({
            type: 'ping',
            clientId: CLIENT_ID,
            timestamp: Date.now()
          });
        }
      });
      
    console.log('Cache sync initialized with Supabase Realtime');
  } catch (error) {
    console.error('Failed to initialize server sync channel:', error);
  }

  // Set up network status monitoring
  window.addEventListener('online', handleNetworkStatusChange);
  window.addEventListener('offline', handleNetworkStatusChange);
};

/**
 * Handle network status changes
 */
const handleNetworkStatusChange = async () => {
  const wasOffline = !isOnline;
  isOnline = navigator.onLine;
  
  console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
  
  // If we're coming back online and have pending updates, process them
  if (isOnline && wasOffline && pendingUpdates.length > 0) {
    console.log(`Processing ${pendingUpdates.length} pending updates after reconnection`);
    
    // Send pending updates as a batch
    await sendBatchUpdate(true);
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
 * Add update to batch and schedule sending
 */
export const addToBatch = (item: BatchItem): void => {
  // Add to pending updates
  pendingUpdates.push(item);
  
  // If we're offline, just store it for later
  if (!isOnline) {
    console.log('Update queued for when network is available:', item);
    return;
  }
  
  // Schedule sending the batch
  if (batchUpdateTimeout === null) {
    batchUpdateTimeout = window.setTimeout(() => {
      sendBatchUpdate();
    }, BATCH_DELAY);
  }
};

/**
 * Send accumulated updates as a batch
 */
export const sendBatchUpdate = async (force: boolean = false): Promise<void> => {
  // Clear the timeout
  if (batchUpdateTimeout !== null) {
    clearTimeout(batchUpdateTimeout);
    batchUpdateTimeout = null;
  }
  
  // Don't send empty batches
  if (pendingUpdates.length === 0) return;
  
  // Skip if offline unless forced
  if (!isOnline && !force) {
    console.log(`Skipping batch update - offline (${pendingUpdates.length} updates queued)`);
    return;
  }
  
  // Process updates in chunks if there are many
  while (pendingUpdates.length > 0) {
    const batchToSend = pendingUpdates.splice(0, MAX_BATCH_SIZE);
    
    console.log(`Sending batch update with ${batchToSend.length} items`);
    
    const batchMessage: SyncMessage = {
      type: 'batch',
      clientId: CLIENT_ID,
      timestamp: Date.now(),
      batch: batchToSend
    };
    
    // Send to other tabs
    broadcastMessage(batchMessage);
    
    // Send to server
    broadcastServerMessage(batchMessage);
  }
};

/**
 * Handle incoming sync message
 */
const handleSyncMessage = (message: SyncMessage): void => {
  // Skip if it's just a ping
  if (message.type === 'ping') return;
  
  try {
    // Handle batch updates
    if (message.type === 'batch' && message.batch) {
      console.log(`Processing batch with ${message.batch.length} updates`);
      message.batch.forEach(item => processSyncItem(item));
      return;
    }
    
    // Handle individual updates
    processSyncItem({
      type: message.type as 'set' | 'remove' | 'clear',
      key: message.key || '',
      data: message.data,
      storage: message.storage
    });
  } catch (error) {
    console.error('Error processing sync message:', error);
  }
};

/**
 * Process a single sync item
 */
const processSyncItem = (item: BatchItem): void => {
  switch (item.type) {
    case 'set':
      if (item.key && item.data !== undefined) {
        // Apply cache update from another client
        setCacheData(
          item.key, 
          item.data, 
          undefined, // Use default duration
          item.storage || 'memory',
          { 
            useCompression: false, // Don't compress again
            batchUpdate: false // Don't notify (to avoid loops)
          }
        );
        console.log(`Cache updated from sync: ${item.key}`);
      }
      break;
      
    case 'remove':
      if (item.key) {
        // Remove item from cache
        removeCacheData(item.key, item.storage || 'memory', false); // Don't notify (to avoid loops)
        console.log(`Cache item removed by sync: ${item.key}`);
      }
      break;
      
    case 'clear':
      if (item.key) {
        // Clear cache items by prefix
        clearCacheByPrefix(item.key); // Clear with prefix
        console.log(`Cache cleared by prefix: ${item.key}`);
      }
      break;
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
  addToBatch({
    type: 'set',
    key,
    data,
    storage
  });
};

/**
 * Notify other clients when cache item is removed
 */
export const notifyCacheRemove = (key: string): void => {
  addToBatch({
    type: 'remove',
    key
  });
};

/**
 * Notify other clients when cache is cleared by prefix
 */
export const notifyCacheClear = (prefix: string): void => {
  addToBatch({
    type: 'clear',
    key: prefix
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
  // Clean up cross-tab communication
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
  
  // Clean up server communication
  if (serverChannel) {
    supabase.removeChannel(serverChannel);
    serverChannel = null;
  }
  
  // Remove network event listeners
  window.removeEventListener('online', handleNetworkStatusChange);
  window.removeEventListener('offline', handleNetworkStatusChange);
  
  // Send any pending updates before closing
  if (isOnline && pendingUpdates.length > 0) {
    sendBatchUpdate(true);
  }
};
