
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if developer mode is enabled for a user
 */
export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();
    
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

/**
 * Toggle developer mode for a user
 */
export const toggleDeveloperMode = async (userId: string, enabled: boolean): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Check if settings exist first
    const { data: existingSettings } = await supabase
      .from('developer_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('developer_settings')
        .update({ is_enabled: enabled })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating developer mode:', error);
        return false;
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('developer_settings')
        .insert({
          user_id: userId,
          is_enabled: enabled,
          cache_time_minutes: 5,
          update_interval_seconds: 30,
          debug_level: 'info',
          realtime_enabled: false,
          show_toolbar: true
        });
      
      if (error) {
        console.error('Error creating developer settings:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in toggleDeveloperMode:', error);
    return false;
  }
};

/**
 * Check if a user has the developer role
 */
export const isDeveloper = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Check if the user has the developer role
    const { data, error } = await supabase
      .from('developer_permissions')
      .select('can_access_developer_tools')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking developer role:', error);
      return false;
    }
    
    return data?.can_access_developer_tools || false;
  } catch (error) {
    console.error('Error in isDeveloper:', error);
    return false;
  }
};
