
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/types/userSettings';

type RealtimeConfig = {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
};

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isEnabled: boolean = true;
  private userSettings: UserSettings | null = null;

  constructor() {
    // Initialize with defaults
    this.isEnabled = true;
  }

  /**
   * Update the manager's configuration based on user settings
   */
  public updateSettings(settings: UserSettings | null): void {
    if (!settings) return;
    
    this.userSettings = settings;
    this.isEnabled = settings.realtime_updates;
    
    // Re-establish connections if settings changed
    if (this.isEnabled && this.channels.size > 0) {
      this.reconnectAll();
    } else if (!this.isEnabled) {
      this.disconnectAll();
    }
  }

  /**
   * Subscribe to a table's changes
   */
  public subscribe(config: RealtimeConfig): () => void {
    if (!this.isEnabled) {
      console.warn('Realtime updates are disabled');
      return () => {};
    }

    const { table, schema = 'public', event = '*', filter, callback } = config;
    
    // Create a unique channel key for this subscription
    const channelKey = `${schema}:${table}:${event}:${filter || 'all'}`;
    
    // Don't create duplicate subscriptions
    if (this.channels.has(channelKey)) {
      return () => this.unsubscribe(channelKey);
    }
    
    try {
      // Create and configure the channel
      const channel = supabase.channel(`realtime:${channelKey}`);
      
      const configuredChannel = channel.on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          if (callback && this.isEnabled) {
            callback(payload);
          }
        }
      );
      
      // Subscribe and store the channel
      configuredChannel.subscribe();
      this.channels.set(channelKey, configuredChannel);
      
      // Return unsubscribe function
      return () => this.unsubscribe(channelKey);
    } catch (error) {
      console.error('Error subscribing to realtime updates:', error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from a specific channel
   */
  private unsubscribe(channelKey: string): void {
    const channel = this.channels.get(channelKey);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelKey);
    }
  }

  /**
   * Disconnect all active channels
   */
  public disconnectAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Reconnect all channels
   */
  private reconnectAll(): void {
    // Implementation would depend on how we track our subscription configs
    // For now, just log that this would happen
    console.log('Would reconnect all channels');
  }

  /**
   * Enable/disable all realtime updates
   */
  public setEnabled(enabled: boolean): void {
    if (this.isEnabled === enabled) return;
    
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.disconnectAll();
    } else {
      this.reconnectAll();
    }
  }
}

// Export a singleton instance
export const realtimeManager = new RealtimeManager();
