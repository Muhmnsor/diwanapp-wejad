
import { supabase } from '@/integrations/supabase/client';
import { DeveloperPermissionChecks } from '../types';

/**
 * Check if a user has developer permissions
 */
export const checkDeveloperPermissions = async (userId: string): Promise<DeveloperPermissionChecks> => {
  if (!userId) {
    return getDefaultPermissions();
  }

  try {
    // Check if user has developer permissions
    const { data, error } = await supabase
      .from('developer_permissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking developer permissions:', error);
      return getDefaultPermissions();
    }
    
    if (!data) {
      return getDefaultPermissions();
    }

    return {
      canAccessDeveloperTools: data.can_access_developer_tools || false,
      canModifySystemSettings: data.can_modify_system_settings || false,
      canAccessApiLogs: data.can_access_api_logs || false,
      canManageDeveloperSettings: data.can_manage_developer_settings || false,
      canViewPerformanceMetrics: data.can_view_performance_metrics || false,
      canDebugQueries: data.can_debug_queries || false,
      canManageRealtime: data.can_manage_realtime || false,
      canAccessAdminPanel: data.can_access_admin_panel || false,
      canExportData: data.can_export_data || false,
      canImportData: data.can_import_data || false
    };
  } catch (error) {
    console.error('Error in checkDeveloperPermissions:', error);
    return getDefaultPermissions();
  }
};

const getDefaultPermissions = (): DeveloperPermissionChecks => {
  return {
    canAccessDeveloperTools: false,
    canModifySystemSettings: false,
    canAccessApiLogs: false,
    canManageDeveloperSettings: false,
    canViewPerformanceMetrics: false,
    canDebugQueries: false,
    canManageRealtime: false,
    canAccessAdminPanel: false,
    canExportData: false,
    canImportData: false
  };
};
