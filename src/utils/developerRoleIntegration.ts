
import { supabase } from '@/integrations/supabase/client';

/**
 * Assign the developer role to a user
 */
export const assignDeveloperRole = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Check if the user already has developer permissions
    const { data: existingPermissions } = await supabase
      .from('developer_permissions')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingPermissions) {
      // Update existing permissions
      const { error } = await supabase
        .from('developer_permissions')
        .update({
          is_developer: true,
          can_access_developer_tools: true,
          can_view_performance_metrics: true,
          can_access_api_logs: true
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating developer permissions:', error);
        return false;
      }
    } else {
      // Create new permissions
      const { error } = await supabase
        .from('developer_permissions')
        .insert({
          user_id: userId,
          is_developer: true,
          can_access_developer_tools: true,
          can_modify_system_settings: false,
          can_access_api_logs: true,
          can_manage_developer_settings: false,
          can_view_performance_metrics: true
        });
      
      if (error) {
        console.error('Error creating developer permissions:', error);
        return false;
      }
    }
    
    // Create developer settings if they don't exist
    const { data: existingSettings } = await supabase
      .from('developer_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!existingSettings) {
      const { error } = await supabase
        .from('developer_settings')
        .insert({
          user_id: userId,
          is_enabled: true,
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
    } else {
      // Update existing settings
      const { error } = await supabase
        .from('developer_settings')
        .update({
          is_enabled: true
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error updating developer settings:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in assignDeveloperRole:', error);
    return false;
  }
};

/**
 * Remove the developer role from a user
 */
export const removeDeveloperRole = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Update developer permissions
    const { error } = await supabase
      .from('developer_permissions')
      .update({
        is_developer: false,
        can_access_developer_tools: false,
        can_modify_system_settings: false,
        can_access_api_logs: false,
        can_manage_developer_settings: false,
        can_view_performance_metrics: false
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing developer permissions:', error);
      return false;
    }
    
    // Disable developer mode
    const { error: settingsError } = await supabase
      .from('developer_settings')
      .update({ is_enabled: false })
      .eq('user_id', userId);
    
    if (settingsError) {
      console.error('Error disabling developer mode:', settingsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeDeveloperRole:', error);
    return false;
  }
};
