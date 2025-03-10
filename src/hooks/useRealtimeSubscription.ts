
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettingsStore } from '@/store/userSettingsStore';
import { useDeveloperStore } from '@/store/developerStore';

interface SubscriptionConfig {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

/**
 * Hook to handle Supabase realtime subscriptions with developer mode integration
 */
export const useRealtimeSubscription = <T>(
  config: SubscriptionConfig,
  onData: (payload: { new: T, old: T | null, eventType: string }) => void,
  enabled: boolean = true
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { settings: userSettings } = useUserSettingsStore();
  const { settings: devSettings } = useDeveloperStore();

  // Check if realtime is enabled based on user and developer settings
  const realtimeEnabled = 
    enabled && 
    (userSettings?.realtime_updates ?? true) && 
    (devSettings?.realtime_enabled ?? true);

  useEffect(() => {
    if (!realtimeEnabled) {
      setIsSubscribed(false);
      return;
    }

    // Generate a unique channel name to avoid conflicts
    const channelName = `${config.table}_${Date.now()}`;
    
    try {
      console.log(`Setting up realtime subscription for ${config.table}...`);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: config.event || '*',
            schema: config.schema || 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            console.log(`Realtime event received for ${config.table}:`, payload);
            onData({
              new: payload.new as T,
              old: payload.old as T | null,
              eventType: payload.eventType
            });
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${config.table}:`, status);
          setIsSubscribed(status === 'SUBSCRIBED');
          
          if (status !== 'SUBSCRIBED') {
            setError(new Error(`Failed to subscribe to realtime updates for ${config.table}, status: ${status}`));
          } else {
            setError(null);
          }
        });

      return () => {
        console.log(`Cleaning up realtime subscription for ${config.table}`);
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      };
    } catch (err) {
      console.error(`Error setting up realtime subscription for ${config.table}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsSubscribed(false);
      return () => {};
    }
  }, [config.table, config.event, config.schema, config.filter, realtimeEnabled, onData]);

  return { isSubscribed, error };
};
