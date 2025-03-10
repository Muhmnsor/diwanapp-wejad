
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeveloperPermission } from '@/components/users/permissions/types';

export const initializeDeveloperRole = async (): Promise<boolean> => {
  try {
    // First check if developer role exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (!existingRole) {
      // Create developer role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'Role for application developers with access to development tools and settings'
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Add developer permissions
      const permissions = [
        {
          name: 'view_developer_tools' as DeveloperPermission,
          description: 'Access developer tools and debugging features',
          module: 'developer'
        },
        {
          name: 'manage_developer_settings' as DeveloperPermission,
          description: 'Manage developer mode settings and configurations',
          module: 'developer'
        },
        {
          name: 'view_performance_metrics' as DeveloperPermission,
          description: 'View application performance metrics and logs',
          module: 'developer'
        }
      ];

      const { error: permError } = await supabase
        .from('permissions')
        .insert(permissions);

      if (permError) throw permError;

      // Link permissions to role
      const { data: permData } = await supabase
        .from('permissions')
        .select('id')
        .eq('module', 'developer');

      if (permData) {
        const rolePermissions = permData.map(perm => ({
          role_id: role.id,
          permission_id: perm.id
        }));

        const { error: linkError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (linkError) throw linkError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing developer role:', error);
    toast.error('Failed to initialize developer role');
    return false;
  }
};

export const isDeveloper = async (userId: string): Promise<boolean> => {
  try {
    // Check if the user has developer role
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Check if any of the roles is 'developer'
    const hasDeveloperRole = data?.some(
      (userRole) => userRole.roles && (userRole.roles as any).name === 'developer'
    );
    
    // Also check if user has admin role, which includes developer privileges
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId);
      
    if (adminError) throw adminError;
    
    const hasAdminRole = adminData?.some(
      (userRole) => userRole.roles && ((userRole.roles as any).name === 'admin' || (userRole.roles as any).name === 'app_admin')
    );
    
    return hasDeveloperRole || hasAdminRole;
  } catch (error) {
    console.error('Error checking developer status:', error);
    return false;
  }
};

// Function to toggle developer mode in user settings
export const toggleDeveloperMode = async (userId: string, enabled: boolean): Promise<boolean> => {
  try {
    // Check if user settings exist
    const { data: existingSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (settingsError && settingsError.code !== 'PGRST116') {
      // Error other than "no rows returned"
      throw settingsError;
    }
    
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('user_settings')
        .update({ developer_mode: enabled })
        .eq('user_id', userId);
        
      if (error) throw error;
    } else {
      // Create new settings
      const { error } = await supabase
        .from('user_settings')
        .insert({ user_id: userId, developer_mode: enabled });
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error toggling developer mode:', error);
    return false;
  }
};

// Function to check if developer mode is enabled for a user
export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('developer_mode')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default (false)
        return false;
      }
      throw error;
    }
    
    return data.developer_mode || false;
  } catch (error) {
    console.error('Error checking developer mode:', error);
    return false;
  }
};
