
import { create } from 'zustand';
import { DeveloperSettings, DeveloperStore } from '@/types/developer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeveloperStore = create<DeveloperStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('developer_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      set({ settings: data });
    } catch (error) {
      console.error('Error fetching developer settings:', error);
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
        .from('developer_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) throw error;
      
      set({ settings: { ...settings, ...newSettings } });
      toast.success('تم تحديث إعدادات المطور بنجاح');
    } catch (error) {
      console.error('Error updating developer settings:', error);
      set({ error: error as Error });
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    } finally {
      set({ isLoading: false });
    }
  },

  toggleDevMode: async () => {
    const { settings, updateSettings } = get();
    if (settings) {
      await updateSettings({ is_enabled: !settings.is_enabled });
    }
  },
}));
