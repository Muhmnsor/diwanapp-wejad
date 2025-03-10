
import { supabase } from "@/integrations/supabase/client";
import { DeveloperPermissionChecks } from "../types";

/**
 * فحص ما إذا كان المستخدم لديه أذونات المطور
 */
export const checkDeveloperPermissions = async (userId: string): Promise<DeveloperPermissionChecks> => {
  try {
    // الحصول على دور المستخدم
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    // التحقق مما إذا كان المستخدم لديه دور المطور
    const isDeveloper = userRoles?.some(ur => ur.role === 'developer') || false;
    
    // الحصول على أذونات المطور
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permissions:permission_id (
          id,
          name
        )
      `)
      .eq('role_id', 'developer');

    // تحديد الأذونات المحددة
    const permissionNames = permissions?.map(p => {
      // تأكد من وجود البيانات قبل الوصول إلى الخصائص
      if (p.permissions && typeof p.permissions === 'object' && 'name' in p.permissions) {
        return p.permissions.name;
      }
      return null;
    }).filter(Boolean) || [];
    
    return {
      canAccessDeveloperTools: isDeveloper && permissionNames.includes('view_developer_tools'),
      canModifySystemSettings: isDeveloper && permissionNames.includes('modify_system_settings'),
      canAccessApiLogs: isDeveloper && permissionNames.includes('access_api_logs')
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
    // الحصول على معرّفات أذونات المطور
    const { data: developerPermissions } = await supabase
      .from('permissions')
      .select('id')
      .in('name', ['view_developer_tools', 'modify_system_settings', 'access_api_logs']);
      
    if (!developerPermissions?.length) {
      console.error('Developer permissions not found');
      return false;
    }

    // الحصول على معرّف دور المطور
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (!developerRole?.id) {
      console.error('Developer role not found');
      return false;
    }

    // إضافة الأذونات إلى دور المطور
    const rolePermissions = developerPermissions.map(permission => ({
      role_id: developerRole.id,
      permission_id: permission.id
    }));

    // حذف الأذونات الحالية
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', developerRole.id);

    // إضافة الأذونات الجديدة
    const { error } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);

    return !error;
  } catch (error) {
    console.error('Error setting up developer permissions:', error);
    return false;
  }
};
