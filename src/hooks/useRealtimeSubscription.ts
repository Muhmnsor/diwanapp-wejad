
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettingsStore } from '@/store/userSettingsStore';
import { useAuthStore } from '@/store/refactored-auth';
import { toast } from 'sonner';

interface UseRealtimeSubscriptionOptions {
  table: string;
  schema?: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  enabled?: boolean;
  onRecordChange?: (payload: any) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeSubscription({
  table,
  schema = 'public',
  filter,
  event = '*',
  enabled = true,
  onRecordChange,
  onError
}: UseRealtimeSubscriptionOptions) {
  const { user } = useAuthStore();
  const { settings } = useUserSettingsStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !isEnabled || !settings?.realtime_updates) {
      return;
    }

    try {
      // Create a unique channel name based on table and filter
      const channelName = `${table}_${filter || 'all'}_${Date.now()}`;
      
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Subscribe to the postgres changes
      channel
        .on(
          'postgres_changes',
          {
            event: event,
            schema: schema,
            table: table,
            filter: filter ? `${filter}=eq.${user.id}` : undefined,
          },
          (payload) => {
            console.log('Realtime update:', payload);
            if (onRecordChange) {
              onRecordChange(payload);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${table} changes`);
            setIsSubscribed(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${table} changes`);
            setError(new Error(`Error subscribing to ${table} changes`));
            if (onError) {
              onError(new Error(`Error subscribing to ${table} changes`));
            }
          }
        });

      return () => {
        console.log(`Unsubscribing from ${table} changes`);
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error in realtime subscription'));
      if (onError) {
        onError(err instanceof Error ? err : new Error('Unknown error in realtime subscription'));
      }
    }
  }, [user, table, schema, filter, event, isEnabled, settings?.realtime_updates, onRecordChange, onError]);

  const toggleSubscription = (value?: boolean) => {
    const newValue = value !== undefined ? value : !isEnabled;
    setIsEnabled(newValue);
    if (!newValue && !isSubscribed) {
      toast.info(`تم إيقاف اشتراك التحديثات المباشرة لـ ${table}`);
    } else if (newValue && !isSubscribed) {
      toast.info(`تم تفعيل اشتراك التحديثات المباشرة لـ ${table}`);
    }
  };

  return { isSubscribed, error, toggleSubscription, isEnabled };
}
