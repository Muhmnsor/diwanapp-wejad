
import { supabase } from "@/integrations/supabase/client";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";
import { isDeveloper } from "@/utils/developer/roleManagement";

export const checkDeveloperPermissions = async (userId: string): Promise<DeveloperPermissionChecks> => {
  try {
    if (!userId) {
      return {
        canAccessDeveloperTools: false,
        canModifySystemSettings: false,
        canAccessApiLogs: false
      };
    }

    // First check if user has developer role
    const hasDeveloperRole = await isDeveloper(userId);
    
    if (!hasDeveloperRole) {
      return {
        canAccessDeveloperTools: false,
        canModifySystemSettings: false,
        canAccessApiLogs: false
      };
    }
    
    // Get developer role ID
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!roleData?.id) {
      return {
        canAccessDeveloperTools: false,
        canModifySystemSettings: false,
        canAccessApiLogs: false
      };
    }
    
    // Check specific permissions - FIXED: don't use role_id directly
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('permission_id, permissions(name)')
      .eq('role_id', roleData.id);
      
    if (!permissions) {
      return {
        canAccessDeveloperTools: hasDeveloperRole,
        canModifySystemSettings: hasDeveloperRole,
        canAccessApiLogs: hasDeveloperRole
      };
    }
    
    // Extract permission names from the result
    const permissionNames = permissions.map(p => 
      // @ts-ignore - permissions.name is available in the result
      p.permissions?.name as string
    );

    return {
      canAccessDeveloperTools: permissionNames.includes('view_developer_tools') || hasDeveloperRole,
      canModifySystemSettings: permissionNames.includes('modify_system_settings') || hasDeveloperRole,
      canAccessApiLogs: permissionNames.includes('access_api_logs') || hasDeveloperRole
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

export const setupDefaultDeveloperPermissions = async (developerRoleId: string): Promise<void> => {
  try {
    // Get all developer permissions
    const { data: permissions } = await supabase
      .from('permissions')
      .select('id, name')
      .eq('module', 'developer');
      
    if (!permissions || permissions.length === 0) {
      console.log('No developer permissions found to assign');
      return;
    }
    
    // Check existing role permissions - FIXED query
    const { data: existingPermissions } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', developerRoleId);
      
    const existingPermissionIds = existingPermissions?.map(p => p.permission_id) || [];
    
    // Filter permissions that need to be added
    const permissionsToAdd = permissions
      .filter(p => !existingPermissionIds.includes(p.id))
      .map(p => ({
        role_id: developerRoleId,
        permission_id: p.id
      }));
      
    if (permissionsToAdd.length === 0) {
      console.log('All developer permissions already assigned to role');
      return;
    }
    
    // Add role permissions
    const { error } = await supabase
      .from('role_permissions')
      .insert(permissionsToAdd);
      
    if (error) {
      console.error('Error setting up default developer permissions:', error);
    } else {
      console.log('Default developer permissions set up successfully');
    }
    
  } catch (error) {
    console.error('Error in setupDefaultDeveloperPermissions:', error);
  }
};
