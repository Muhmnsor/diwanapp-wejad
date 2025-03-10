
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/refactored-auth';
import { isDeveloper } from '@/utils/developerRole';
import { toast } from 'sonner';
import { DeveloperSettings } from '@/types/developer';

export const useDeveloperSettings = () => {
  const { user } = useAuthStore();
  const [isDeveloperUser, setIsDeveloperUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDeveloperStatus = async () => {
      if (user?.id) {
        setIsLoading(true);
        const devStatus = await isDeveloper(user.id);
        setIsDeveloperUser(devStatus);
        setIsLoading(false);
      }
    };

    checkDeveloperStatus();
  }, [user?.id]);

  const updateSettings = async (settings: Partial<DeveloperSettings>) => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('developer_settings')
        .update(settings)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('تم تحديث إعدادات المطور بنجاح');
    } catch (error) {
      console.error('Error updating developer settings:', error);
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    }
  };

  return {
    isDeveloperUser,
    isLoading,
    updateSettings
  };
};
