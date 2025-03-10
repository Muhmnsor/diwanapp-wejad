
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { UserSettings } from '@/types/userSettings';

/**
 * Initialize realtime subscription based on user settings
 */
export const initializeRealtime = (
  userSettings: UserSettings | null,
  onEvent: (payload: any) => void
): { channel: RealtimeChannel | null, cleanup: () => void } => {
  if (!userSettings?.realtime_updates) {
    // If realtime updates are disabled, return a no-op cleanup
    return { channel: null, cleanup: () => {} };
  }
  
  // Use a more unique channel name based on user ID to prevent conflicts
  const channelName = `realtime_${userSettings.user_id}_main`;
  let realtimeChannel: RealtimeChannel | null = null;
  
  try {
    // Create and configure channel
    realtimeChannel = supabase.channel(channelName);
    
    // Setup event handlers for different tables
    setupEventHandlers(realtimeChannel, onEvent);
    
    // Subscribe to the channel
    realtimeChannel.subscribe((status) => {
      console.log(`Realtime subscription status: ${status}`);
      
      if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to realtime updates');
      }
    });
    
    // Return the channel and cleanup function
    return {
      channel: realtimeChannel,
      cleanup: () => {
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
        }
      }
    };
  } catch (err) {
    console.error('Error setting up realtime manager:', err);
    return { channel: null, cleanup: () => {} };
  }
};

// Setup event handlers for different tables
const setupEventHandlers = (
  channel: RealtimeChannel,
  onEvent: (payload: any) => void
) => {
  // Listen for task updates
  channel.on(
    // Fix the type issue by using string literal with 'as any'
    'postgres_changes' as any,
    {
      event: '*',
      schema: 'public',
      table: 'tasks'
    },
    (payload) => {
      onEvent({
        type: 'task',
        action: payload.eventType,
        data: payload.new,
        old: payload.old
      });
    }
  );
  
  // Listen for notification updates
  channel.on(
    // Fix the type issue by using string literal with 'as any'
    'postgres_changes' as any,
    {
      event: '*',
      schema: 'public',
      table: 'notifications'
    },
    (payload) => {
      onEvent({
        type: 'notification',
        action: payload.eventType,
        data: payload.new
      });
    }
  );
  
  // Add additional tables as needed
};

// Utility to track user presence in a shared workspace
export const trackUserPresence = (
  workspaceId: string, 
  userId: string,
  userInfo: { name: string, role: string }
): { channel: RealtimeChannel | null, cleanup: () => void } => {
  if (!workspaceId || !userId) {
    return { channel: null, cleanup: () => {} };
  }
  
  const channelName = `presence_${workspaceId}`;
  const presenceChannel = supabase.channel(channelName);
  
  // Track user presence
  const userStatus = {
    user_id: userId,
    workspace_id: workspaceId,
    online_at: new Date().toISOString(),
    user_info: userInfo
  };
  
  presenceChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track(userStatus);
    }
  });
  
  return {
    channel: presenceChannel,
    cleanup: () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    }
  };
};
