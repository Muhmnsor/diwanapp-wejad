
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if developer mode is enabled for the current user
 */
export const isDeveloperModeEnabled = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check developer settings
    const { data, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking developer mode status:', error);
      return false;
    }
    
    return data?.is_enabled || false;
  } catch (error) {
    console.error('Error in isDeveloperModeEnabled:', error);
    return false;
  }
};

/**
 * Toggle developer mode for the current user
 */
export const toggleDeveloperMode = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Get current status
    const { data: currentSettings, error: getError } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (getError && !getError.message.includes('No rows found')) {
      console.error('Error getting developer settings:', getError);
      return false;
    }
    
    const newState = !(currentSettings?.is_enabled);
    
    // Update or insert settings
    const { error: upsertError } = await supabase
      .from('developer_settings')
      .upsert({
        user_id: user.id,
        is_enabled: newState,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
      
    if (upsertError) {
      console.error('Error toggling developer mode:', upsertError);
      return false;
    }
    
    console.log(`Developer mode ${newState ? 'enabled' : 'disabled'}`);
    return true;
  } catch (error) {
    console.error('Error in toggleDeveloperMode:', error);
    return false;
  }
};
