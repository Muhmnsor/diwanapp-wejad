
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSettingsStore {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,
  
  fetchSettings: async (userId: string) => {
    if (!userId) {
      set({ error: new Error('User ID required') });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              theme: 'system',
              language: 'ar',
              notifications_enabled: true,
              email_notifications: true
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          set({ settings: newSettings, isLoading: false });
          return;
        }
        
        throw error;
      }
      
      set({ settings: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching user settings:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Unknown error fetching user settings'),
        isLoading: false 
      });
    }
  },
  
  updateSettings: async (settings: Partial<UserSettings>) => {
    const currentSettings = get().settings;
    
    if (!currentSettings) {
      set({ error: new Error('No settings to update') });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('id', currentSettings.id);
      
      if (error) throw error;
      
      // Update local state with new settings
      set({ 
        settings: { ...currentSettings, ...settings },
        isLoading: false 
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Unknown error updating user settings'),
        isLoading: false 
      });
    }
  }
}));
