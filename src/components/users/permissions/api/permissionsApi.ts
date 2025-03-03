
import { supabase } from "@/integrations/supabase/client";
import { Permission } from "../types";
import { Role } from "../../types";

// Fetch all permissions
export const fetchPermissions = async (): Promise<Permission[]> => {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*, application:application_id(name, code)')
      .order('module', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }

    // تحديث الاسم بإضافة اسم التطبيق إذا وجد
    const enhancedPermissions = data.map(permission => {
      const appName = permission.application?.name || 'النظام';
      return {
        ...permission,
        module: `${appName} - ${permission.module}`
      };
    });

    return enhancedPermissions as Permission[];
  } catch (error) {
    console.error('Error in permissions query:', error);
    throw error;
  }
};

// Fetch role permissions
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

    return data.map(rp => rp.permission_id);
  } catch (error) {
    console.error('Error in role permissions query:', error);
    return [];
  }
};

// Save role permissions
export const saveRolePermissions = async (
  roleId: string, 
  selectedPermissions: string[]
): Promise<void> => {
  if (!roleId) {
    throw new Error("Role ID is required");
  }

  console.log("Saving permissions for role:", roleId);
  console.log("Selected permissions:", selectedPermissions);
  
  // Delete existing permissions
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);
  
  if (deleteError) {
    console.error("Error deleting existing permissions:", deleteError);
    throw deleteError;
  }
  
  // Insert new permissions if there are any
  if (selectedPermissions.length > 0) {
    const rolePermissions = selectedPermissions.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId
    }));
    
    console.log("Inserting role permissions:", rolePermissions);
    
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);
    
    if (insertError) {
      console.error("Error inserting permissions:", insertError);
      throw insertError;
    }
  }
};
