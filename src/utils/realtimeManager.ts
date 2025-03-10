
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/store/userSettingsStore';
import { DeveloperSettings } from '@/types/developer.d';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Class to manage realtime subscriptions
 */
export class RealtimeManager {
  private channels: RealtimeChannel[] = [];
  private isEnabled: boolean = true;
  
  /**
   * Configure realtime settings based on user and developer settings
   */
  configure(userSettings?: UserSettings | null, devSettings?: DeveloperSettings | null): void {
    // Enable realtime if developer settings explicitly enable it
    this.isEnabled = devSettings?.realtime_enabled !== false;
    
    // If realtime is disabled, remove all existing channels
    if (!this.isEnabled) {
      this.removeAllChannels();
    }
  }
  
  /**
   * Subscribe to table changes
   */
  subscribeToTable({
    table,
    schema = 'public',
    event = '*',
    filter,
    callback
  }: {
    table: string;
    schema?: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: Record<string, any>;
    callback: (payload: any) => void;
  }): RealtimeChannel | null {
    if (!this.isEnabled) {
      console.log('Realtime is disabled, not subscribing');
      return null;
    }
    
    try {
      // Create a unique channel name
      const channelName = `table:${table}:${event}:${Date.now()}`;
      
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Subscribe to postgres changes
      channel
        .on(
          'postgres_changes',
          {
            event: event,
            schema: schema,
            table: table,
            filter: filter
          },
          (payload) => {
            console.log(`Realtime ${event} on ${table}:`, payload);
            callback(payload);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
        });
      
      // Store the channel
      this.channels.push(channel);
      
      return channel;
    } catch (error) {
      console.error('Error subscribing to table:', error);
      return null;
    }
  }
  
  /**
   * Subscribe to user presence
   */
  subscribeToPresence({
    room,
    events = ['sync', 'join', 'leave'],
    callback
  }: {
    room: string;
    events?: Array<'sync' | 'join' | 'leave'>;
    callback: (eventType: string, payload: any) => void;
  }): RealtimeChannel | null {
    if (!this.isEnabled) {
      return null;
    }
    
    try {
      const channel = supabase.channel(room);
      
      // Subscribe to presence events
      events.forEach(event => {
        channel.on('presence', { event }, (payload) => {
          callback(event, payload);
        });
      });
      
      channel.subscribe();
      
      // Store the channel
      this.channels.push(channel);
      
      return channel;
    } catch (error) {
      console.error('Error subscribing to presence:', error);
      return null;
    }
  }
  
  /**
   * Remove a specific channel
   */
  removeChannel(channel: RealtimeChannel): void {
    try {
      // Unsubscribe from the channel
      supabase.removeChannel(channel);
      
      // Remove from our list
      this.channels = this.channels.filter(c => c !== channel);
    } catch (error) {
      console.error('Error removing channel:', error);
    }
  }
  
  /**
   * Remove all channels
   */
  removeAllChannels(): void {
    try {
      // Unsubscribe from all channels
      this.channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      
      // Clear the list
      this.channels = [];
    } catch (error) {
      console.error('Error removing all channels:', error);
    }
  }
}

// Export a singleton instance
export const realtimeManager = new RealtimeManager();
