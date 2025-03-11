import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isDeveloper } from "./roleManagement";

export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if user has developer role
    const hasDevRole = await isDeveloper(userId);
    
    if (!hasDevRole) {
      return false;
    }
    
    // Get developer settings
    const { data: settings, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error checking developer mode settings:', error);
      return false;
    }
    
    return settings?.is_enabled || false;
  } catch (error) {
    console.error('Error in isDeveloperModeEnabled:', error);
    return false;
  }
};

export const toggleDeveloperMode = async (userId: string, enableMode: boolean): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if user has developer role
    const hasDevRole = await isDeveloper(userId);
    
    if (!hasDevRole) {
      toast.error('ليس لديك صلاحية للوصول إلى وضع المطور');
      return false;
    }
    
    // Update developer settings
    const { data: settings, error: settingsError } = await supabase
      .from('developer_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (settingsError || !settings) {
      // If settings don't exist, create them
      const { error: insertError } = await supabase
        .from('developer_settings')
        .insert({ 
          user_id: userId,
          is_enabled: enableMode 
        });
        
      if (insertError) {
        console.error('Error creating developer settings:', insertError);
        toast.error('حدث خطأ أثناء إنشاء إعدادات المطور');
        return false;
      }
    } else {
      // Otherwise update existing settings
      const { error } = await supabase
        .from('developer_settings')
        .update({ is_enabled: enableMode })
        .eq('id', settings.id);
        
      if (error) {
        console.error('Error toggling developer mode:', error);
        toast.error('حدث خطأ أثناء تحديث وضع المطور');
        return false;
      }
    }
    
    toast.success(enableMode ? 'تم تفعيل وضع المطور' : 'تم تعطيل وضع المطور');
    return true;
  } catch (error) {
    console.error('Error in toggleDeveloperMode:', error);
    toast.error('حدث خطأ أثناء تحديث وضع المطور');
    return false;
  }
};
