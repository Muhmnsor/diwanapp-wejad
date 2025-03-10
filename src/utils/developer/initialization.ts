
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Initialize developer role by making sure it exists
export const initializeDeveloperRole = async (): Promise<boolean> => {
  try {
    // Check if developer role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking for developer role:', roleError);
      return false;
    }
    
    // If role doesn't exist, create it
    if (!existingRole) {
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'مطور النظام مع صلاحيات خاصة'
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating developer role:', createError);
        return false;
      }
      
      console.log('Developer role created successfully');
      
      // Assign default developer permissions to the new role
      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('id')
        .eq('module', 'developer');
        
      if (permissionsError) {
        console.error('Error fetching developer permissions:', permissionsError);
        return true; // Still return true as role was created
      }
      
      if (permissions && permissions.length > 0) {
        const rolePermissions = permissions.map(p => ({
          role_id: newRole.id,
          permission_id: p.id
        }));
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);
          
        if (insertError) {
          console.error('Error assigning default permissions to developer role:', insertError);
        } else {
          console.log('Default permissions assigned to developer role');
        }
      }
      
      return true;
    }
    
    return true; // Role already exists
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
    return false;
  }
};

// Auto assign the developer role to the first admin user if no developers exist
export const autoAssignDeveloperRole = async (): Promise<boolean> => {
  try {
    // Check if there are any users with developer role
    const { data: developerUsers, error: checkError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', (await supabase
        .from('roles')
        .select('id')
        .eq('name', 'developer')
        .single()).data?.id);
        
    if (checkError) {
      console.error('Error checking for existing developers:', checkError);
      return false;
    }
    
    // If there are already users with developer role, do nothing
    if (developerUsers && developerUsers.length > 0) {
      return true;
    }
    
    // Get the first admin user
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1);
      
    if (adminError) {
      console.error('Error fetching admin profiles:', adminError);
      return false;
    }
    
    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('No admin users found for auto-assignment of developer role');
      return false;
    }
    
    const adminId = adminProfiles[0].id;
    
    // Get developer role ID
    const { data: developerRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (roleError) {
      console.error('Error fetching developer role:', roleError);
      return false;
    }
    
    // Assign role to admin
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: adminId,
        role_id: developerRole.id
      });
      
    if (assignError) {
      console.error('Error auto-assigning developer role:', assignError);
      return false;
    }
    
    console.log('Successfully auto-assigned developer role to admin user');
    return true;
  } catch (error) {
    console.error('Error in autoAssignDeveloperRole:', error);
    return false;
  }
};
