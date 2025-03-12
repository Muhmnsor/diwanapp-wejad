
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to get all available permissions
export const fetchAllPermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('module', { ascending: true });
    
  if (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
  
  return data || [];
};

// Function to ensure the developer role exists and has the right permissions
export const initializeDeveloperRole = async () => {
  try {
    // 1. Check if developer role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (roleError && !roleError.message.includes('No rows found')) {
      console.error('Error checking developer role:', roleError);
      return;
    }
    
    let roleId;
    
    // 2. Create developer role if it doesn't exist
    if (!existingRole) {
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'System developer with comprehensive access to all functionality'
        })
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating developer role:', createError);
        return;
      }
      
      roleId = newRole.id;
      console.log('Developer role created with ID:', roleId);
    } else {
      roleId = existingRole.id;
      console.log('Developer role exists with ID:', roleId);
    }
    
    // 3. Assign all permissions to developer role
    const permissions = await fetchAllPermissions();
    
    if (permissions.length > 0) {
      // 3.1 Delete existing developer role permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);
        
      if (deleteError) {
        console.error('Error clearing developer role permissions:', deleteError);
      }
      
      // 3.2 Create permission assignments for all permissions
      const rolePermissions = permissions.map(permission => ({
        role_id: roleId,
        permission_id: permission.id
      }));
      
      // Insert in batches to avoid request size limits
      const batchSize = 100;
      for (let i = 0; i < rolePermissions.length; i += batchSize) {
        const batch = rolePermissions.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error('Error assigning permissions to developer role:', insertError);
        }
      }
      
      console.log(`Assigned ${permissions.length} permissions to developer role`);
    }
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
  }
};
