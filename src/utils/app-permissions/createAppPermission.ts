
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Add an app permission to a role
 */
export async function addAppPermissionToRole(roleId: string, appName: string): Promise<boolean> {
  try {
    // Check if the permission already exists
    const { data: existingPermission, error: checkError } = await supabase
      .from('app_permissions')
      .select('*')
      .eq('role_id', roleId)
      .eq('app_name', appName)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected
      console.error('Error checking for existing permission:', checkError);
      toast.error('خطأ في التحقق من الصلاحيات الحالية');
      return false;
    }
    
    // If permission already exists, return true
    if (existingPermission) {
      console.log(`Permission for ${appName} already exists for role ${roleId}`);
      return true;
    }
    
    // Add the permission
    const { error } = await supabase
      .from('app_permissions')
      .insert({
        role_id: roleId,
        app_name: appName
      });
      
    if (error) {
      console.error('Error adding app permission:', error);
      toast.error('خطأ في إضافة صلاحية التطبيق');
      return false;
    }
    
    toast.success(`تمت إضافة صلاحية ${appName} بنجاح`);
    return true;
  } catch (error) {
    console.error('Error in addAppPermissionToRole:', error);
    toast.error('خطأ غير متوقع في إضافة صلاحية التطبيق');
    return false;
  }
}

/**
 * Remove an app permission from a role
 */
export async function removeAppPermissionFromRole(roleId: string, appName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('app_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('app_name', appName);
      
    if (error) {
      console.error('Error removing app permission:', error);
      toast.error('خطأ في إزالة صلاحية التطبيق');
      return false;
    }
    
    toast.success(`تمت إزالة صلاحية ${appName} بنجاح`);
    return true;
  } catch (error) {
    console.error('Error in removeAppPermissionFromRole:', error);
    toast.error('خطأ غير متوقع في إزالة صلاحية التطبيق');
    return false;
  }
}

/**
 * Get all app permissions for a role
 */
export async function getAppPermissionsForRole(roleId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('app_permissions')
      .select('app_name')
      .eq('role_id', roleId);
      
    if (error) {
      console.error('Error getting app permissions:', error);
      return [];
    }
    
    return data.map(p => p.app_name);
  } catch (error) {
    console.error('Error in getAppPermissionsForRole:', error);
    return [];
  }
}

/**
 * Get all available apps in the system
 */
export function getAvailableApps(): string[] {
  return [
    'hr',
    'accounting',
    'meetings',
    'tasks',
    'documents'
  ];
}
