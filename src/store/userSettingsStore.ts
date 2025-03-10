
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSettings {
  id: string;
  user_id: string;
  developer_mode: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  language_preference: 'ar' | 'en';
  notification_enabled: boolean;
  realtime_updates: boolean;
  cache_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

interface UserSettingsStore {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  toggleDeveloperMode: () => Promise<void>;
  toggleTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  toggleLanguage: (language: 'ar' | 'en') => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleRealtimeUpdates: () => Promise<void>;
  updateCacheDuration: (minutes: number) => Promise<void>;
}

export const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First check if the user has settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no settings found, create default settings
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              developer_mode: false,
              theme_preference: 'system',
              language_preference: 'ar',
              notification_enabled: true,
              realtime_updates: true,
              cache_duration_minutes: 5
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          set({ settings: newSettings });
        } else {
          throw error;
        }
      } else {
        set({ settings: data });
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const { settings } = get();
      if (!settings?.id) return;

      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) throw error;
      
      set({ settings: { ...settings, ...newSettings } });
      toast.success('تم تحديث الإعدادات بنجاح');
    } catch (error) {
      console.error('Error updating user settings:', error);
      set({ error: error as Error });
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    } finally {
      set({ isLoading: false });
    }
  },

  toggleDeveloperMode: async () => {
    const { settings, updateSettings } = get();
    if (settings) {
      await updateSettings({ developer_mode: !settings.developer_mode });
    }
  },

  toggleTheme: async (theme) => {
    const { updateSettings } = get();
    await updateSettings({ theme_preference: theme });
  },

  toggleLanguage: async (language) => {
    const { updateSettings } = get();
    await updateSettings({ language_preference: language });
  },

  toggleNotifications: async () => {
    const { settings, updateSettings } = get();
    if (settings) {
      await updateSettings({ notification_enabled: !settings.notification_enabled });
    }
  },

  toggleRealtimeUpdates: async () => {
    const { settings, updateSettings } = get();
    if (settings) {
      await updateSettings({ realtime_updates: !settings.realtime_updates });
    }
  },

  updateCacheDuration: async (minutes) => {
    const { updateSettings } = get();
    await updateSettings({ cache_duration_minutes: minutes });
  }
}));
