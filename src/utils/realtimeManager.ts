import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type RealtimeCallback = (payload: any) => void;

interface RealtimeSubscription {
  tableName: string;
  callback: RealtimeCallback;
  channel: any;
}

// Store active subscriptions
const activeSubscriptions: RealtimeSubscription[] = [];

/**
 * Subscribe to realtime changes for a specific table
 */
export const subscribeToTable = (
  tableName: string,
  callback: RealtimeCallback
): string => {
  // Check if subscription already exists
  const existingSubscription = activeSubscriptions.find(
    (sub) => sub.tableName === tableName
  );
  
  if (existingSubscription) {
    console.log(`Subscription for ${tableName} already exists, reusing`);
    return tableName;
  }
  
  try {
    // Use type assertion for the channel subscription
    const channel = supabase
      .channel(`realtime-${tableName}`)
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: tableName,
      }, callback)
      .subscribe(status => {
        console.log(`Realtime subscription status for ${tableName}:`, status);
      });
    
    // Store the subscription
    activeSubscriptions.push({
      tableName,
      callback,
      channel,
    });
    
    console.log(`Subscribed to realtime updates for ${tableName}`);
    return tableName;
  } catch (error) {
    console.error(`Error subscribing to ${tableName}:`, error);
    toast.error(`فشل في الاشتراك في التحديثات المباشرة لـ ${tableName}`);
    return '';
  }
};

/**
 * Unsubscribe from realtime changes for a specific table
 */
export const unsubscribeFromTable = (tableName: string): boolean => {
  const index = activeSubscriptions.findIndex(
    (sub) => sub.tableName === tableName
  );
  
  if (index === -1) {
    console.warn(`No subscription found for ${tableName}`);
    return false;
  }
  
  try {
    const { channel } = activeSubscriptions[index];
    supabase.removeChannel(channel);
    
    // Remove from active subscriptions
    activeSubscriptions.splice(index, 1);
    console.log(`Unsubscribed from realtime updates for ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error unsubscribing from ${tableName}:`, error);
    return false;
  }
};

/**
 * Unsubscribe from all realtime subscriptions
 */
export const unsubscribeFromAll = (): boolean => {
  try {
    activeSubscriptions.forEach(({ channel }) => {
      supabase.removeChannel(channel);
    });
    
    // Clear all subscriptions
    activeSubscriptions.length = 0;
    console.log('Unsubscribed from all realtime updates');
    return true;
  } catch (error) {
    console.error('Error unsubscribing from all tables:', error);
    return false;
  }
};

/**
 * Get all active subscriptions
 */
export const getActiveSubscriptions = (): string[] => {
  return activeSubscriptions.map((sub) => sub.tableName);
};

/**
 * Check if a table has an active subscription
 */
export const hasActiveSubscription = (tableName: string): boolean => {
  return activeSubscriptions.some((sub) => sub.tableName === tableName);
};
