
import { supabase } from "@/integrations/supabase/client";
import { PermissionData } from "../types";

// جلب جميع الأذونات
export const fetchPermissions = async (): Promise<PermissionData[]> => {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
};

// جلب أذونات دور محدد
export const fetchRolePermissions = async (roleId: string): Promise<string[]> => {
  try {
    if (!roleId) return [];
    
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);
      
    if (error) throw error;
    
    return data?.map(item => item.permission_id) || [];
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return [];
  }
};

// حفظ أذونات الدور
export const saveRolePermissions = async (roleId: string, permissionIds: string[]): Promise<boolean> => {
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);
    
  if (deleteError) {
    console.error('Error deleting existing role permissions:', deleteError);
    throw deleteError;
  }
  
  if (permissionIds.length === 0) {
    return true; // لا توجد أذونات للإضافة
  }
  
  const rolePermissions = permissionIds.map(permissionId => ({
    role_id: roleId,
    permission_id: permissionId
  }));
  
  const { error: insertError } = await supabase
    .from('role_permissions')
    .insert(rolePermissions);
    
  if (insertError) {
    console.error('Error inserting role permissions:', insertError);
    throw insertError;
  }
  
  return true;
};
