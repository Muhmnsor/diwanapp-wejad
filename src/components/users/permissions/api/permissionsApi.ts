
import { supabase } from "@/integrations/supabase/client";
import { PermissionData } from "../types";

/**
 * Fetch all available permissions
 */
export const fetchPermissions = async (): Promise<PermissionData[]> => {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchPermissions:', error);
    return [];
  }
};

/**
 * Fetch permissions for a specific role
 */
export const fetchRolePermissions = async (roleId: string): Promise<string[]> => {
  try {
    if (!roleId) return [];
    
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);
      
    if (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
    
    return data?.map(item => item.permission_id) || [];
  } catch (error) {
    console.error('Error in fetchRolePermissions:', error);
    return [];
  }
};

/**
 * Save role permissions with proper transaction handling
 */
export const saveRolePermissions = async (roleId: string, permissionIds: string[]): Promise<boolean> => {
  try {
    // First delete existing permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);
      
    if (deleteError) {
      console.error('Error deleting existing role permissions:', deleteError);
      throw deleteError;
    }
    
    // If no permissions to add, we're done
    if (permissionIds.length === 0) {
      return true;
    }
    
    // Create the role permissions objects
    const rolePermissions = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId
    }));
    
    // Insert new permissions
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);
      
    if (insertError) {
      console.error('Error inserting role permissions:', insertError);
      throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveRolePermissions:', error);
    throw error;
  }
};
