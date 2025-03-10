
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserSettings } from '@/types/userSettings';

/**
 * A class to manage Supabase realtime subscriptions
 */
export class RealtimeManager {
  private channels: Map<string, any> = new Map();
  private isEnabled: boolean = false;
  private userId: string | null = null;
  private userSettings: UserSettings | null = null;

  /**
   * Initialize the realtime manager
   */
  constructor() {
    console.log('Realtime manager initialized');
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string | null) {
    this.userId = userId;
    console.log('Realtime manager user set:', userId);
  }

  /**
   * Set user settings for realtime configuration
   */
  setUserSettings(settings: UserSettings | null) {
    this.userSettings = settings;
    this.isEnabled = settings?.realtime_updates || false;
    console.log('Realtime manager settings updated:', this.isEnabled);
  }

  /**
   * Enable or disable realtime updates
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.removeAllChannels();
    }
    
    console.log('Realtime manager enabled:', enabled);
  }

  /**
   * Subscribe to a table's changes
   */
  subscribeToTable(
    table: string, 
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
    callback: (payload: any) => void,
    filter?: string
  ) {
    if (!this.isEnabled || !this.userId) {
      console.log('Realtime subscription skipped - disabled or no user');
      return null;
    }
    
    const channelName = `${table}_${filter || 'all'}_${Date.now()}`;
    
    try {
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Subscribe to postgres changes
      channel
        .on(
          'postgres_changes',
          {
            event: event,
            schema: 'public',
            table: table,
            filter: filter ? `${filter}=eq.${this.userId}` : undefined,
          },
          (payload) => {
            console.log(`Realtime update for ${table}:`, payload);
            callback(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${table} changes`);
            this.channels.set(channelName, channel);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${table} changes`);
            toast.error(`خطأ في الاشتراك بتحديثات ${table}`);
          }
        });
      
      return channelName;
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      toast.error('خطأ في إعداد التحديثات المباشرة');
      return null;
    }
  }

  /**
   * Subscribe to presence in a room/channel
   */
  subscribeToPresence(
    room: string,
    onSync?: (state: any) => void,
    onJoin?: (key: string, presence: any) => void,
    onLeave?: (key: string, presence: any) => void
  ) {
    if (!this.isEnabled || !this.userId) {
      console.log('Presence subscription skipped - disabled or no user');
      return null;
    }
    
    try {
      const channel = supabase.channel(room);
      
      // Set up presence handlers
      if (onSync) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          onSync(state);
        });
      }
      
      if (onJoin) {
        channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          onJoin(key, newPresences);
        });
      }
      
      if (onLeave) {
        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          onLeave(key, leftPresences);
        });
      }
      
      // Subscribe to the channel
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to presence in ${room}`);
          this.channels.set(room, channel);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to presence in ${room}`);
        }
      });
      
      return room;
    } catch (error) {
      console.error('Error setting up presence subscription:', error);
      return null;
    }
  }

  /**
   * Track presence in a room
   */
  async trackPresence(room: string, data: any) {
    if (!this.isEnabled || !this.userId) {
      console.log('Tracking presence skipped - disabled or no user');
      return false;
    }
    
    const channel = this.channels.get(room);
    if (!channel) {
      console.error(`No channel found for room ${room}`);
      return false;
    }
    
    try {
      await channel.track(data);
      return true;
    } catch (error) {
      console.error('Error tracking presence:', error);
      return false;
    }
  }

  /**
   * Remove a specific channel
   */
  removeChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Removed channel ${channelName}`);
      return true;
    }
    return false;
  }

  /**
   * Remove all channels
   */
  removeAllChannels() {
    for (const [name, channel] of this.channels.entries()) {
      supabase.removeChannel(channel);
      console.log(`Removed channel ${name}`);
    }
    this.channels.clear();
    console.log('All realtime channels removed');
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
