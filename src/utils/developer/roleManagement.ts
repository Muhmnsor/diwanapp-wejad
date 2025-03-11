
import { supabase } from "@/integrations/supabase/client";

/**
 * Initializes the developer role if it doesn't exist
 */
export async function initializeDeveloperRole() {
  try {
    // Check if developer role exists
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for developer role:', checkError);
      return;
    }
    
    // If role doesn't exist, create it
    if (!existingRole) {
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'System developer with access to developer tools and settings'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating developer role:', createError);
        return;
      }
      
      console.log('Developer role created successfully:', newRole);
    } else {
      console.log('Developer role already exists.');
    }
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
  }
}

/**
 * Checks if a user has developer permissions
 */
export async function isDeveloper(userId: string): Promise<boolean> {
  try {
    // Check if user has developer role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId);
    
    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return false;
    }
    
    // Check if any role is a developer role
    const hasDeveloperRole = userRoles?.some(userRole => {
      if (userRole.roles) {
        const roleName = Array.isArray(userRole.roles) 
          ? userRole.roles[0]?.name
          : (userRole.roles as any).name;
        
        return roleName === 'developer';
      }
      return false;
    });
    
    return Boolean(hasDeveloperRole);
  } catch (error) {
    console.error('Error checking developer status:', error);
    return false;
  }
}

/**
 * Assigns the developer role to a user
 */
export async function assignDeveloperRole(userId: string): Promise<boolean> {
  try {
    // Get developer role ID
    const { data: developerRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
    
    if (roleError || !developerRole) {
      console.error('Error finding developer role:', roleError);
      return false;
    }
    
    // Check if user already has the role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', developerRole.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing role:', checkError);
      return false;
    }
    
    // If role is not assigned, assign it
    if (!existingRole) {
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: developerRole.id
        });
      
      if (assignError) {
        console.error('Error assigning developer role:', assignError);
        return false;
      }
      
      console.log(`Developer role assigned to user ${userId}`);
      return true;
    }
    
    console.log(`User ${userId} already has developer role`);
    return true;
  } catch (error) {
    console.error('Error in assignDeveloperRole:', error);
    return false;
  }
}

/**
 * Removes the developer role from a user
 */
export async function removeDeveloperRole(userId: string): Promise<boolean> {
  try {
    // Get developer role ID
    const { data: developerRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
    
    if (roleError || !developerRole) {
      console.error('Error finding developer role:', roleError);
      return false;
    }
    
    // Remove the role assignment
    const { error: removeError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', developerRole.id);
    
    if (removeError) {
      console.error('Error removing developer role:', removeError);
      return false;
    }
    
    console.log(`Developer role removed from user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in removeDeveloperRole:', error);
    return false;
  }
}
