
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { DeveloperSettings, DeveloperStore } from '@/types/developer.d';
import { useAuthStore } from './refactored-auth';

export const useDeveloperStore = create<DeveloperStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,
  
  fetchSettings: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      set({ error: new Error('User not authenticated') });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('developer_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      set({ settings: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching developer settings:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Unknown error fetching developer settings'),
        isLoading: false 
      });
    }
  },
  
  updateSettings: async (settings: Partial<DeveloperSettings>) => {
    const { user } = useAuthStore.getState();
    const currentSettings = get().settings;
    
    if (!user) {
      set({ error: new Error('User not authenticated') });
      return;
    }
    
    if (!currentSettings) {
      set({ error: new Error('No settings to update') });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('developer_settings')
        .update(settings)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state with new settings
      set({ 
        settings: { ...currentSettings, ...settings },
        isLoading: false 
      });
    } catch (error) {
      console.error('Error updating developer settings:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Unknown error updating developer settings'),
        isLoading: false 
      });
    }
  },
  
  toggleDevMode: async () => {
    const { settings } = get();
    
    if (!settings) {
      set({ error: new Error('No settings to toggle') });
      return;
    }
    
    await get().updateSettings({ is_enabled: !settings.is_enabled });
  }
}));
