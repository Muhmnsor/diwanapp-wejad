
import { supabase } from "@/integrations/supabase/client";
import { DeveloperPermissionChecks } from "../types";

/**
 * فحص ما إذا كان المستخدم لديه أذونات المطور
 */
export const checkDeveloperPermissions = async (userId: string): Promise<DeveloperPermissionChecks> => {
  try {
    // Get developer role ID
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
    
    if (!developerRole) {
      return {
        canAccessDeveloperTools: false,
        canModifySystemSettings: false,
        canAccessApiLogs: false
      };
    }
    
    // Check if user has developer role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', developerRole.id)
      .maybeSingle();
    
    const isDeveloper = !!userRole;
    
    if (!isDeveloper) {
      return {
        canAccessDeveloperTools: false,
        canModifySystemSettings: false,
        canAccessApiLogs: false
      };
    }
    
    // Get permission IDs
    const { data: permissions } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', ['view_developer_tools', 'modify_system_settings', 'access_api_logs']);
    
    if (!permissions || permissions.length === 0) {
      return {
        canAccessDeveloperTools: false,
        canModifySystemSettings: false,
        canAccessApiLogs: false
      };
    }
    
    // Create a map of permission names to IDs
    const permissionMap = permissions.reduce((map, permission) => {
      map[permission.name] = permission.id;
      return map;
    }, {} as Record<string, string>);
    
    // Check which permissions the developer role has
    const { data: rolePermissions } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', developerRole.id);
    
    if (!rolePermissions) {
      return {
        canAccessDeveloperTools: isDeveloper,
        canModifySystemSettings: isDeveloper,
        canAccessApiLogs: isDeveloper
      };
    }
    
    const rolePermissionIds = rolePermissions.map(rp => rp.permission_id);
    
    return {
      canAccessDeveloperTools: isDeveloper && (rolePermissionIds.includes(permissionMap['view_developer_tools'])),
      canModifySystemSettings: isDeveloper && (rolePermissionIds.includes(permissionMap['modify_system_settings'])),
      canAccessApiLogs: isDeveloper && (rolePermissionIds.includes(permissionMap['access_api_logs']))
    };
  } catch (error) {
    console.error('Error checking developer permissions:', error);
    return {
      canAccessDeveloperTools: false,
      canModifySystemSettings: false,
      canAccessApiLogs: false
    };
  }
};

/**
 * إعداد أذونات المطور الافتراضية
 */
export const setupDefaultDeveloperPermissions = async (developerId: string): Promise<boolean> => {
  try {
    // Get developer permissions IDs
    const { data: permissions } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', ['view_developer_tools', 'modify_system_settings', 'access_api_logs']);
    
    if (!permissions || permissions.length === 0) {
      console.error('Developer permissions not found');
      return false;
    }
    
    // Associate permissions with developer role
    const rolePermissions = permissions.map(permission => ({
      role_id: developerId,
      permission_id: permission.id
    }));
    
    // First delete existing role permissions
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', developerId);
    
    // Add new permissions
    const { error } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);
    
    if (error) {
      console.error('Error setting up developer permissions:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in setupDefaultDeveloperPermissions:', error);
    return false;
  }
};
