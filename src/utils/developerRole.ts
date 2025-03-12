
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Permission {
  id: string;
  name: string;
  module: string;
}

/**
 * Ensures the developer role exists and has all permissions assigned to it
 */
export const initializeDeveloperRole = async () => {
  try {
    console.log("Checking developer role and permissions...");
    
    // 1. Make sure the developer role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'developer')
      .single();
    
    if (roleError && roleError.code !== 'PGRST116') {
      console.error("Error checking developer role:", roleError);
      return;
    }
    
    let developerId;
    
    // If role doesn't exist, create it
    if (!existingRole) {
      console.log("Developer role doesn't exist, creating it...");
      
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'Full system access with developer tools'
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error("Error creating developer role:", createError);
        return;
      }
      
      developerId = newRole.id;
      console.log("Created developer role with ID:", developerId);
    } else {
      developerId = existingRole.id;
      console.log("Found existing developer role with ID:", developerId);
    }
    
    // 2. Get all permissions
    const { data: allPermissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id, name, module');
    
    if (permissionsError) {
      console.error("Error fetching permissions:", permissionsError);
      return;
    }
    
    console.log(`Found ${allPermissions.length} permissions to assign to developer role`);
    
    // 3. Get existing role permissions
    const { data: existingPerms, error: existingPermsError } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', developerId);
    
    if (existingPermsError) {
      console.error("Error fetching existing role permissions:", existingPermsError);
      return;
    }
    
    // Create a set of existing permission IDs
    const existingPermIds = new Set(existingPerms.map(p => p.permission_id));
    console.log(`Developer role already has ${existingPermIds.size} permissions`);
    
    // 4. Find permissions to add (those that don't already exist)
    const permissionsToAdd = allPermissions
      .filter(p => !existingPermIds.has(p.id))
      .map(p => ({
        role_id: developerId,
        permission_id: p.id
      }));
    
    console.log(`Adding ${permissionsToAdd.length} new permissions to developer role`);
    
    // 5. Add missing permissions if any
    if (permissionsToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToAdd);
      
      if (insertError) {
        console.error("Error adding permissions to developer role:", insertError);
        return;
      }
      
      console.log("Successfully assigned all permissions to developer role");
    } else {
      console.log("Developer role already has all permissions");
    }
    
    // 6. Make sure the developer role has access to all apps
    const appNames = [
      'events', 'documents', 'tasks', 'ideas', 'finance', 
      'users', 'website', 'store', 'notifications', 'requests', 'developer'
    ];
    
    // Get existing app permissions
    const { data: existingAppPerms, error: appPermsError } = await supabase
      .from('app_permissions')
      .select('app_name')
      .eq('role_id', developerId);
    
    if (appPermsError) {
      console.error("Error fetching existing app permissions:", appPermsError);
      return;
    }
    
    // Create a set of existing app permissions
    const existingAppNames = new Set(existingAppPerms.map(p => p.app_name));
    
    // Find apps to add
    const appsToAdd = appNames
      .filter(app => !existingAppNames.has(app))
      .map(app => ({
        role_id: developerId,
        app_name: app
      }));
    
    // Add missing app permissions if any
    if (appsToAdd.length > 0) {
      const { error: insertAppError } = await supabase
        .from('app_permissions')
        .insert(appsToAdd);
      
      if (insertAppError) {
        console.error("Error adding app permissions to developer role:", insertAppError);
        return;
      }
      
      console.log(`Added ${appsToAdd.length} app permissions to developer role`);
    }
    
    console.log("Developer role initialization complete");
    
  } catch (error) {
    console.error("Error initializing developer role:", error);
  }
};
