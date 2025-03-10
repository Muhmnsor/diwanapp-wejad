
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Initialize developer role in the system
 */
export const initializeDeveloperRole = async (): Promise<boolean> => {
  try {
    // Check if developer role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (checkError && !checkError.message.includes('No rows found')) {
      console.error('Error checking for developer role:', checkError);
      return false;
    }
    
    // If role already exists, nothing to do
    if (existingRole) {
      console.log('Developer role already exists');
      return true;
    }
    
    // Create developer role
    const { data: newRole, error: createError } = await supabase
      .from('roles')
      .insert({
        name: 'developer',
        description: 'دور للمطورين مع صلاحيات خاصة للوصول إلى أدوات التطوير'
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating developer role:', createError);
      return false;
    }
    
    console.log('Developer role created successfully');
    
    // Initialize standard permissions for the developer role
    await initializeDeveloperPermissions(newRole.id);
    
    return true;
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
    return false;
  }
};

/**
 * Initialize permissions for the developer role
 */
const initializeDeveloperPermissions = async (roleId: string): Promise<boolean> => {
  try {
    // Get developer-specific permissions
    const { data: devPermissions, error: permError } = await supabase
      .from('permissions')
      .select('id')
      .eq('module', 'development')
      .or('name.ilike.%developer%,module.ilike.%developer%');
      
    if (permError) {
      console.error('Error fetching developer permissions:', permError);
      return false;
    }
    
    if (!devPermissions || devPermissions.length === 0) {
      console.log('No developer permissions found to assign');
      return true;
    }
    
    // Assign all developer permissions to the developer role
    const rolePermissions = devPermissions.map(permission => ({
      role_id: roleId,
      permission_id: permission.id
    }));
    
    const { error: assignError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);
      
    if (assignError) {
      console.error('Error assigning developer permissions:', assignError);
      return false;
    }
    
    console.log(`Assigned ${devPermissions.length} permissions to developer role`);
    return true;
  } catch (error) {
    console.error('Error in initializeDeveloperPermissions:', error);
    return false;
  }
};

/**
 * Auto-assign developer role to the current user (for development environments)
 */
export const autoAssignDeveloperRole = async (): Promise<boolean> => {
  try {
    // Only run in development environment
    if (import.meta.env.MODE !== 'development') {
      return false;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in, cannot assign developer role');
      return false;
    }
    
    // Get developer role ID
    const { data: devRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (roleError) {
      console.error('Error fetching developer role:', roleError);
      return false;
    }
    
    // Check if user already has developer role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .eq('role_id', devRole.id)
      .maybeSingle();
      
    if (checkError && !checkError.message.includes('No rows found')) {
      console.error('Error checking user developer role:', checkError);
      return false;
    }
    
    if (existingRole) {
      console.log('User already has developer role');
      return true;
    }
    
    // Assign developer role to the user
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: devRole.id
      });
      
    if (assignError) {
      console.error('Error assigning developer role to user:', assignError);
      return false;
    }
    
    console.log('Developer role assigned to current user');
    toast.success('تم تعيين دور المطور تلقائيًا');
    
    return true;
  } catch (error) {
    console.error('Error in autoAssignDeveloperRole:', error);
    return false;
  }
};
