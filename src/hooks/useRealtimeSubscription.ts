
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionConfig = {
  table: string;
  schema?: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onData?: (payload: any) => void;
  enabled?: boolean;
};

/**
 * A hook to easily subscribe to Supabase realtime changes
 */
export function useRealtimeSubscription(config: SubscriptionConfig) {
  const {
    table,
    schema = 'public',
    filter,
    event = '*',
    onData,
    enabled = true
  } = config;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let channelName = `realtime:${schema}:${table}`;
    if (filter) {
      channelName += `:${filter}`;
    }

    try {
      // Create a channel for this specific subscription
      const realtimeChannel = supabase.channel(channelName);

      // Configure the channel
      const configuredChannel = realtimeChannel.on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table,
          ...(filter ? { filter: filter } : {})
        },
        (payload) => {
          if (onData) {
            onData(payload);
          }
        }
      );

      // Subscribe and set the channel
      configuredChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
        } else if (status === 'CHANNEL_ERROR') {
          setError(new Error('Failed to subscribe to realtime updates'));
          setIsSubscribed(false);
        }
      });

      setChannel(configuredChannel);

      // Cleanup function
      return () => {
        supabase.removeChannel(configuredChannel);
        setChannel(null);
        setIsSubscribed(false);
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error in realtime subscription'));
      return () => {};
    }
  }, [table, schema, filter, event, onData, enabled]);

  return {
    isSubscribed,
    error,
    channel
  };
}
