
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/refactored-auth';
import { isDeveloper } from '@/utils/developer/roleManagement';
import { isDeveloperModeEnabled } from '@/utils/developer/modeManagement';
import { toast } from 'sonner';

export const useDeveloperSettings = () => {
  const { user } = useAuthStore();
  const [hasDeveloperRole, setHasDeveloperRole] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDeveloperStatus = async () => {
      if (!user) {
        setHasDeveloperRole(false);
        setIsDeveloperMode(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // التحقق مما إذا كان المستخدم لديه دور المطور
        const hasDevRole = await isDeveloper(user.id);
        setHasDeveloperRole(hasDevRole);
        
        // التحقق مما إذا كان وضع المطور مفعّل
        if (hasDevRole) {
          const devModeEnabled = await isDeveloperModeEnabled(user.id);
          setIsDeveloperMode(devModeEnabled);
        } else {
          setIsDeveloperMode(false);
        }
      } catch (error) {
        console.error('Error checking developer settings:', error);
        toast.error('حدث خطأ أثناء التحقق من إعدادات المطور');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkDeveloperStatus();
  }, [user]);
  
  return {
    hasDeveloperRole,
    isDeveloperMode,
    isLoading
  };
};
