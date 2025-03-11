
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
  try {
    // First, delete all existing role permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);
      
    if (deleteError) {
      console.error('Error deleting existing role permissions:', deleteError);
      throw deleteError;
    }
    
    // If there are no permissions to add, we're done
    if (permissionIds.length === 0) {
      return true;
    }
    
    // Prepare the data for insertion
    const rolePermissions = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId
    }));
    
    // Insert the new role permissions
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);
      
    if (insertError) {
      console.error('Error inserting role permissions:', insertError);
      throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving role permissions:', error);
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
