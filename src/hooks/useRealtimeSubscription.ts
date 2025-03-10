
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionOptions {
  schema?: string;
  table: string;
  event?: RealtimeEvent;
  filter?: string;
}

/**
 * Hook for subscribing to Supabase realtime updates
 * 
 * @param options - Configuration options for the subscription
 * @param callback - Function to call when an event occurs
 */
export const useRealtimeSubscription = <T extends Record<string, any>>(
  options: SubscriptionOptions,
  callback: (payload: { new: T | null; old: T | null; eventType: string }) => void,
  enabled = true
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!enabled) {
      setIsSubscribed(false);
      return;
    }
    
    try {
      const { schema = 'public', table, event = '*' } = options;
      
      // Create channel for realtime subscription
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', 
          {
            event,
            schema,
            table,
            ...(options.filter ? { filter: options.filter } : {})
          },
          (payload) => {
            callback({
              new: payload.new as T,
              old: payload.old as T,
              eventType: payload.eventType
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }
        });
      
      // Cleanup function to remove channel on unmount
      return () => {
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error in realtime subscription'));
      setIsSubscribed(false);
    }
  }, [options.table, options.event, options.filter, enabled]);
  
  return { isSubscribed, error };
};
