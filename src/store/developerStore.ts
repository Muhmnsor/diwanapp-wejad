
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeveloperSettings, DeveloperStore } from '@/types/developer';
import { useAuthStore } from './authStore';

export const useDeveloperStore = create<DeveloperStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // First check if user has the developer role
      const isDev = await isDeveloper(user.id);
      
      if (!isDev) {
        set({ settings: null, isLoading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('developer_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      set({ settings: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching developer settings:', error);
      set({ error: error as Error, isLoading: false });
    }
  },
  
  updateSettings: async (settings) => {
    const { user } = useAuthStore.getState();
    const currentSettings = get().settings;
    
    if (!user || !currentSettings) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('developer_settings')
        .update(settings)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set({
        settings: { ...currentSettings, ...settings },
        isLoading: false
      });
      
      toast.success('Developer settings updated');
    } catch (error) {
      console.error('Error updating developer settings:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to update developer settings');
    }
  },
  
  toggleDevMode: async () => {
    const { settings } = get();
    
    if (!settings) return;
    
    await get().updateSettings({
      is_enabled: !settings.is_enabled
    });
  }
}));

// Helper function to check if a user is a developer
const isDeveloper = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:roles(name)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return false;
    }
    
    return data.some(role => {
      if (role.roles && typeof role.roles === 'object') {
        if ('name' in role.roles) {
          return role.roles.name === 'developer';
        }
      }
      return false;
    });
  } catch (error) {
    console.error('Error checking developer status:', error);
    return false;
  }
};
