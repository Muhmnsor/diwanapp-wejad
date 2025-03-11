
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

// حفظ أذونات الدور باستخدام دالة RPC المخصصة
export const saveRolePermissions = async (roleId: string, permissionIds: string[]): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'update_role_permissions', 
      { 
        p_role_id: roleId,
        p_permission_ids: permissionIds
      }
    );
    
    if (error) {
      console.error('Error saving role permissions through RPC:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveRolePermissions:', error);
    throw error;
  }
};

// Check if user has a specific permission
export const hasUserPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  try {
    if (!userId || !permissionName) return false;

    const { data, error } = await supabase
      .rpc('has_permission', { 
        p_user_id: userId, 
        p_permission_name: permissionName 
      });

    if (error) {
      console.error('Error checking user permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in hasUserPermission:', error);
    return false;
  }
};

// Get all permissions for a user
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    if (!userId) return [];

    const { data, error } = await supabase
      .rpc('get_user_permissions', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return [];
  }
};
