
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
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    // The correct way to access the nested role name from the joined table
    return data?.roles?.name === 'developer';
  } catch (error) {
    console.error('Error checking developer status:', error);
    return false;
  }
};
