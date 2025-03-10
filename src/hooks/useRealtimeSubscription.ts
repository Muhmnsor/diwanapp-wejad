import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useDeveloperStore } from '@/store/developerStore';

interface UseRealtimeSubscriptionProps {
  tableName: string;
  onDataChange?: (payload: any) => void;
  enabled?: boolean;
  channelId?: string;
}

export const useRealtimeSubscription = ({
  tableName,
  onDataChange,
  enabled = true,
  channelId = `realtime-${tableName}-${Math.random().toString(36).substring(2, 9)}`
}: UseRealtimeSubscriptionProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { settings } = useDeveloperStore();

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      try {
        // Check if realtime is enabled in developer settings
        if (settings && !settings.realtime_enabled) {
          console.log('Realtime is disabled in developer settings');
          return;
        }

        if (!enabled || !tableName) {
          return;
        }

        const handleRealtimeChange = (payload: any) => {
          console.log(`Realtime update for ${tableName}:`, payload);
          if (onDataChange) {
            onDataChange(payload);
          }
        };

        // Use type assertion for the channel subscription
        channel = supabase
          .channel(channelId)
          .on('postgres_changes' as any, {
            event: '*',
            schema: 'public',
            table: tableName,
          }, handleRealtimeChange)
          .subscribe();

        setIsSubscribed(true);
      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
        setError(err instanceof Error ? err : new Error('Unknown error in realtime subscription'));
        setIsSubscribed(false);
      }
    };

    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (channel) {
        console.log(`Unsubscribing from ${tableName} realtime updates`);
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      }
    };
  }, [tableName, onDataChange, enabled, channelId, settings]);

  return { isSubscribed, error };
};
