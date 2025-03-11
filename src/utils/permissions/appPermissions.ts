import { supabase } from "@/integrations/supabase/client";
import { AppItem } from "@/components/admin/dashboard/DashboardApps";

/**
 * Checks if a user has permission to access a specific app
 */
export const hasAppPermission = async (userId: string, appName: string): Promise<boolean> => {
  try {
    // If user is admin or developer, they have access to all apps
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          id,
          name
        )
      `)
      .eq('user_id', userId);
      
    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return false;
    }
    
    // Check if user has admin or developer role - they get full access
    const hasAdminRole = userRoles?.some(userRole => {
      if (userRole.roles) {
        const roleName = Array.isArray(userRole.roles) 
          ? userRole.roles[0]?.name
          : (userRole.roles as any).name;
        
        return roleName === 'admin' || roleName === 'developer';
      }
      return false;
    });
    
    if (hasAdminRole) {
      return true;
    }
    
    // Otherwise check specific permissions
    const roleIds = userRoles?.map(ur => {
      if (Array.isArray(ur.roles)) {
        return ur.roles[0]?.id;
      } else {
        return (ur.roles as any).id;
      }
    }).filter(Boolean) || [];
    
    if (roleIds.length === 0) {
      return false;
    }
    
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          name,
          module
        )
      `)
      .in('role_id', roleIds);
      
    if (permError) {
      console.error('Error checking permissions:', permError);
      return false;
    }
    
    // Map app names to permission modules
    const appToModuleMap: Record<string, string> = {
      'إدارة المستخدمين': 'users',
      'إدارة المهام': 'tasks',
      'إدارة المستندات': 'documents',
      'إدارة الأفكار': 'ideas',
      'الإدارة المالية': 'finance',
      'إدارة الموقع': 'website',
      'إدارة المتجر': 'store',
      'إدارة الإشعارات': 'notifications',
      'إدارة الطلبات': 'requests',
      'إعدادات المطور': 'developer'
    };
    
    const moduleToCheck = appToModuleMap[appName];
    if (!moduleToCheck) return false;
    
    // Check if user has any permissions for this module
    return permissions?.some(permission => {
      if (permission.permissions) {
        const permData = Array.isArray(permission.permissions) 
          ? permission.permissions[0]
          : permission.permissions;
        
        return permData?.module === moduleToCheck;
      }
      return false;
    }) || false;
    
  } catch (error) {
    console.error('Error checking app permission:', error);
    return false;
  }
};

/**
 * Filter a list of apps based on user permissions
 */
export const filterAppsByPermission = async (userId: string, apps: AppItem[]): Promise<AppItem[]> => {
  try {
    // Special case: admins and developers see all apps
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          id,
          name
        )
      `)
      .eq('user_id', userId);
      
    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return [];
    }
    
    // Check if user has admin or developer role
    const hasAdminRole = userRoles?.some(userRole => {
      if (userRole.roles) {
        const roleName = Array.isArray(userRole.roles) 
          ? userRole.roles[0]?.name
          : (userRole.roles as any).name;
        
        return roleName === 'admin' || roleName === 'developer';
      }
      return false;
    });
    
    if (hasAdminRole) {
      return apps; // Admin/developer sees all apps
    }
    
    // Get user's role IDs
    const roleIds = userRoles?.map(ur => {
      if (Array.isArray(ur.roles)) {
        return ur.roles[0]?.id;
      } else {
        return (ur.roles as any).id;
      }
    }).filter(Boolean) || [];
    
    if (roleIds.length === 0) {
      return []; // No roles = no apps
    }
    
    // Get modules the user has permission to access
    const { data: permissionData, error: permError } = await supabase
      .from('permissions')
      .select('module')
      .filter('id', 'in', (
        supabase
          .from('role_permissions')
          .select('permission_id')
          .in('role_id', roleIds)
      ));
      
    if (permError) {
      console.error('Error fetching permission modules:', permError);
      return [];
    }
    
    const allowedModules = new Set(permissionData?.map(p => p.module) || []);
    
    // Map app titles to their permission modules
    const appModuleMap: Record<string, string> = {
      'إدارة المستخدمين': 'users',
      'إدارة المهام': 'tasks',
      'إدارة المستندات': 'documents',
      'إدارة الأفكار': 'ideas',
      'الإدارة المالية': 'finance',
      'إدارة الموقع': 'website',
      'إدارة المتجر': 'store',
      'إدارة الإشعارات': 'notifications',
      'إدارة الطلبات': 'requests',
      'إعدادات المطور': 'developer'
    };
    
    // Filter apps based on permissions
    return apps.filter(app => {
      const moduleNeeded = appModuleMap[app.title];
      return moduleNeeded && allowedModules.has(moduleNeeded);
    });
    
  } catch (error) {
    console.error('Error filtering apps by permission:', error);
    return [];
  }
};
