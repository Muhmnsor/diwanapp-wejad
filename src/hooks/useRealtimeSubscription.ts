
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDeveloperStore } from '@/store/developerStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionProps {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string;
  callback: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to Supabase realtime changes
 */
export const useRealtimeSubscription = ({
  table,
  schema = 'public',
  event = '*',
  filter,
  filterValue,
  callback,
  enabled = true
}: UseRealtimeSubscriptionProps) => {
  const { settings } = useDeveloperStore();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    // Check if developer settings disable realtime
    const realTimeEnabled = settings?.realtime_enabled !== false;
    
    if (!realTimeEnabled) {
      return;
    }
    
    try {
      // Create filter object if filter and filterValue are provided
      const filterOptions = filter && filterValue 
        ? { [filter]: filterValue } 
        : undefined;
      
      // Create channel with unique name for this subscription
      const realtimeChannel = supabase.channel(`table:${table}:${event}:${Math.random()}`);
      
      // Subscribe to postgres changes
      realtimeChannel
        .on(
          'postgres_changes',
          {
            event: event,
            schema: schema,
            table: table,
            filter: filterOptions
          },
          (payload) => {
            console.log(`Realtime ${event} on ${table}:`, payload);
            callback(payload);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
          setIsSubscribed(status === 'SUBSCRIBED');
        });
      
      setChannel(realtimeChannel);
      
      // Cleanup function to remove the channel on unmount
      return () => {
        realtimeChannel.unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return () => {};
    }
  }, [table, schema, event, filter, filterValue, callback, enabled, settings?.realtime_enabled]);
  
  return { isSubscribed, error };
};
