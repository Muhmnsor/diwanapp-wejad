
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { assignDeveloperRole } from "./developerRoleIntegration";

export const initializeDeveloperRole = async (): Promise<void> => {
  try {
    // Check if developer role exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (!existingRole) {
      // Create developer role if it doesn't exist
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'دور المطور مع صلاحيات للوصول إلى أدوات التطوير وإعدادات النظام'
        })
        .select('id')
        .single();

      if (roleError) {
        console.error('Error creating developer role:', roleError);
        return;
      }

      console.log('Developer role created successfully:', newRole);
      
      // Add developer permissions
      const developerPermissions = [
        {
          name: 'view_developer_tools',
          description: 'الوصول إلى أدوات المطور',
          module: 'developer'
        },
        {
          name: 'modify_system_settings',
          description: 'تعديل إعدادات النظام',
          module: 'developer'
        },
        {
          name: 'access_api_logs',
          description: 'الوصول إلى سجلات API',
          module: 'developer'
        }
      ];
      
      const { error: permissionsError } = await supabase
        .from('permissions')
        .upsert(developerPermissions, { onConflict: 'name' });
        
      if (permissionsError) {
        console.error('Error creating developer permissions:', permissionsError);
      }
    }
    
    // Initialize developer settings
    await initializeDeveloperSettings();
    
    // Auto-assign developer role to all admins
    await assignDeveloperRoleToAdmins();
    
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
  }
};

const initializeDeveloperSettings = async (): Promise<void> => {
  try {
    // Check if developer settings exist
    const { data: existingSettings } = await supabase
      .from('developer_settings')
      .select('id')
      .single();
      
    if (!existingSettings) {
      // Create default developer settings
      const { error } = await supabase
        .from('developer_settings')
        .insert({
          is_enabled: false,
          show_toolbar: true,
          realtime_enabled: true,
          cache_time_minutes: 5,
          update_interval_seconds: 30,
          debug_level: 'info'
        });
        
      if (error) {
        console.error('Error creating developer settings:', error);
      } else {
        console.log('Developer settings created successfully');
      }
    }
  } catch (error) {
    console.error('Error in initializeDeveloperSettings:', error);
  }
};

// Assign developer role to all admin users
const assignDeveloperRoleToAdmins = async (): Promise<void> => {
  try {
    // Get all admin users
    const { data: adminUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true);
      
    if (usersError) {
      console.error('Error fetching admin users:', usersError);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found to assign developer role');
      return;
    }
    
    // Assign developer role to each admin
    for (const admin of adminUsers) {
      await autoAssignDeveloperRole(admin.id);
    }
    
    console.log(`Developer role assigned to ${adminUsers.length} admin users`);
    
  } catch (error) {
    console.error('Error in assignDeveloperRoleToAdmins:', error);
  }
};

// Auto-assign developer role to admin
export const autoAssignDeveloperRole = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    // Check if user is admin
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (userData?.is_admin) {
      // Auto-assign developer role to admin
      await assignDeveloperRole(userId);
    }
  } catch (error) {
    console.error('Error in autoAssignDeveloperRole:', error);
  }
};

// Add missing isDeveloper function
export const isDeveloper = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Check if developer role exists
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!developerRole?.id) {
      return false;
    }
    
    // Check if user has developer role
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', developerRole.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking if user is developer:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isDeveloper:', error);
    return false;
  }
};

// Add missing isDeveloperModeEnabled function
export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if user has developer role
    const hasDevRole = await isDeveloper(userId);
    
    if (!hasDevRole) {
      return false;
    }
    
    // Get developer settings
    const { data: settings, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .single();
      
    if (error) {
      console.error('Error checking developer mode settings:', error);
      return false;
    }
    
    return settings?.is_enabled || false;
  } catch (error) {
    console.error('Error in isDeveloperModeEnabled:', error);
    return false;
  }
};

// Add toggleDeveloperMode function
export const toggleDeveloperMode = async (userId: string, enableMode: boolean): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if user has developer role
    const hasDevRole = await isDeveloper(userId);
    
    if (!hasDevRole) {
      toast.error('ليس لديك صلاحية للوصول إلى وضع المطور');
      return false;
    }
    
    // Update developer settings
    const { data: settings } = await supabase
      .from('developer_settings')
      .select('id')
      .single();
      
    if (!settings?.id) {
      toast.error('لم يتم العثور على إعدادات المطور');
      return false;
    }
    
    const { error } = await supabase
      .from('developer_settings')
      .update({ is_enabled: enableMode })
      .eq('id', settings.id);
      
    if (error) {
      console.error('Error toggling developer mode:', error);
      toast.error('حدث خطأ أثناء تحديث وضع المطور');
      return false;
    }
    
    toast.success(enableMode ? 'تم تفعيل وضع المطور' : 'تم تعطيل وضع المطور');
    return true;
  } catch (error) {
    console.error('Error in toggleDeveloperMode:', error);
    toast.error('حدث خطأ أثناء تحديث وضع المطور');
    return false;
  }
};

// Initialize developer role on application start
export const initializeDeveloperFeatures = async (): Promise<void> => {
  try {
    await initializeDeveloperRole();
    console.log('Developer features initialized successfully');
  } catch (error) {
    console.error('Failed to initialize developer features:', error);
  }
};
