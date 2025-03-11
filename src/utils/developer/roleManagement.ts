
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
