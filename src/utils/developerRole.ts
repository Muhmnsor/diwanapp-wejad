
import { supabase } from "@/integrations/supabase/client";
import { APP_ROLE_ACCESS } from "@/components/admin/dashboard/getAppsList";

// Function to ensure the developer role exists with necessary permissions
export const initializeDeveloperRole = async () => {
  try {
    // 1. Check if the developer role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (roleError && roleError.code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error('Error checking for developer role:', roleError);
      return;
    }

    // Create role if it doesn't exist
    let roleId: string;
    if (!existingRole) {
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'Full system access for developers and technical administrators'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating developer role:', createError);
        return;
      }
      
      roleId = newRole.id;
      console.log('Created developer role:', newRole);
    } else {
      roleId = existingRole.id;
    }

    // 2. Migrate app permissions from hardcoded to database
    await migrateAppPermissions(roleId);
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
  }
};

// Migrate app permissions from hardcoded APP_ROLE_ACCESS to database
export const migrateAppPermissions = async (roleId: string) => {
  try {
    // Get existing app permissions
    const { data: existingPerms, error: permsError } = await supabase
      .from('app_permissions')
      .select('app_name')
      .eq('role_id', roleId);

    if (permsError) {
      console.error('Error fetching existing app permissions:', permsError);
      return;
    }

    const existingApps = existingPerms?.map(p => p.app_name) || [];
    
    // Get all apps that developer role should have access to
    const developerApps = Object.keys(APP_ROLE_ACCESS).filter(
      appKey => APP_ROLE_ACCESS[appKey as keyof typeof APP_ROLE_ACCESS].includes('developer')
    );
    
    // Find apps that need to be added
    const appsToAdd = developerApps.filter(app => !existingApps.includes(app));
    
    if (appsToAdd.length > 0) {
      // Create app permission records to insert
      const permRecords = appsToAdd.map(app => ({
        role_id: roleId,
        app_name: app
      }));
      
      // Insert new permissions
      const { error: insertError } = await supabase
        .from('app_permissions')
        .insert(permRecords);
        
      if (insertError) {
        console.error('Error inserting app permissions:', insertError);
      } else {
        console.log(`Added ${appsToAdd.length} app permissions for developer role`);
      }
    }
  } catch (error) {
    console.error('Error in migrateAppPermissions:', error);
  }
};
