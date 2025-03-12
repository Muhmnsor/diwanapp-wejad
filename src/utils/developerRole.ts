
import { supabase } from '@/integrations/supabase/client';

/**
 * Initializes the developer role by ensuring it exists and has all permissions
 */
export const initializeDeveloperRole = async () => {
  try {
    // Check if developer role exists
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error checking developer role:', roleError);
      return;
    }

    let developerRoleId;

    // If developer role doesn't exist, create it
    if (!roleData) {
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'مطور النظام مع كامل الصلاحيات'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating developer role:', createError);
        return;
      }

      developerRoleId = newRole.id;
    } else {
      developerRoleId = roleData.id;
    }

    // Get all permissions
    const { data: allPermissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id');

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
      return;
    }

    // Get existing role permissions
    const { data: existingRolePermissions, error: existingError } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', developerRoleId);

    if (existingError) {
      console.error('Error fetching existing role permissions:', existingError);
      return;
    }

    // Find permissions that need to be added
    const existingPermissionIds = existingRolePermissions.map(p => p.permission_id);
    const permissionsToAdd = allPermissions
      .filter(p => !existingPermissionIds.includes(p.id))
      .map(p => ({
        role_id: developerRoleId,
        permission_id: p.id
      }));

    // Add missing permissions
    if (permissionsToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToAdd);

      if (insertError) {
        console.error('Error adding permissions to developer role:', insertError);
      } else {
        console.log(`Added ${permissionsToAdd.length} permissions to developer role`);
      }
    }

    // Add all app permissions to developer role
    const appNames = [
      'events', 'documents', 'tasks', 'ideas', 'finance', 
      'users', 'website', 'store', 'notifications', 'requests', 'developer'
    ];

    // Get existing app permissions
    const { data: existingAppPerms, error: existingAppError } = await supabase
      .from('app_permissions')
      .select('app_name')
      .eq('role_id', developerRoleId);

    if (existingAppError) {
      console.error('Error fetching existing app permissions:', existingAppError);
      return;
    }

    // Find app permissions that need to be added
    const existingAppNames = existingAppPerms.map(p => p.app_name);
    const appPermsToAdd = appNames
      .filter(name => !existingAppNames.includes(name))
      .map(name => ({
        role_id: developerRoleId,
        app_name: name
      }));

    // Add missing app permissions
    if (appPermsToAdd.length > 0) {
      const { error: insertAppError } = await supabase
        .from('app_permissions')
        .insert(appPermsToAdd);

      if (insertAppError) {
        console.error('Error adding app permissions to developer role:', insertAppError);
      } else {
        console.log(`Added ${appPermsToAdd.length} app permissions to developer role`);
      }
    }

  } catch (error) {
    console.error('Error initializing developer role:', error);
  }
};
