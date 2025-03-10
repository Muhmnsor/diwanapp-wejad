
import { DeveloperPermissionChecks } from '../types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a user has developer permissions
 */
export const checkDeveloperPermissions = async (userId: string): Promise<DeveloperPermissionChecks> => {
  try {
    // Default permissions - all false
    const defaultPermissions: DeveloperPermissionChecks = {
      canAccessDeveloperTools: false,
      canModifySystemSettings: false,
      canAccessApiLogs: false,
      canManageDeveloperSettings: false,
      canViewPerformanceMetrics: false
    };
    
    // Check if user exists
    if (!userId) {
      console.error('No user ID provided for permission check');
      return defaultPermissions;
    }
    
    // Query database for user's developer permissions
    const { data, error } = await supabase
      .from('developer_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking developer permissions:', error);
      return defaultPermissions;
    }
    
    if (!data) {
      console.log('No developer permissions found for user:', userId);
      return defaultPermissions;
    }
    
    // Return permissions based on data
    return {
      canAccessDeveloperTools: data.can_access_developer_tools || false,
      canModifySystemSettings: data.can_modify_system_settings || false,
      canAccessApiLogs: data.can_access_api_logs || false,
      canManageDeveloperSettings: data.can_manage_developer_settings || false,
      canViewPerformanceMetrics: data.can_view_performance_metrics || false
    };
  } catch (error) {
    console.error('Error in checkDeveloperPermissions:', error);
    return {
      canAccessDeveloperTools: false,
      canModifySystemSettings: false,
      canAccessApiLogs: false,
      canManageDeveloperSettings: false,
      canViewPerformanceMetrics: false
    };
  }
};
