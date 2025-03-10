
import { supabase } from "@/integrations/supabase/client";

export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking developer mode:', error);
      return false;
    }
    
    return data?.is_enabled || false;
  } catch (error) {
    console.error('Error in isDeveloperModeEnabled:', error);
    return false;
  }
};

export const toggleDeveloperMode = async (userId: string, enabled: boolean): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { error } = await supabase
      .from('developer_settings')
      .upsert({
        user_id: userId,
        is_enabled: enabled,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error toggling developer mode:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in toggleDeveloperMode:', error);
    return false;
  }
};
