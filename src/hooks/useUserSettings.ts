
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  cache_preferences: {
    enabled: boolean;
    duration: number;
  };
  developer_mode: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      return data as UserSettings;
    },
    enabled: !!user?.id,
  });

  const { mutate: updateSettings } = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      if (!user?.id) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] });
      toast.success('تم تحديث الإعدادات بنجاح');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    }
  });

  return {
    settings,
    isLoading,
    updateSettings
  };
};
