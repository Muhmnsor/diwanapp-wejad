
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const isDeveloper = async (userId: string): Promise<boolean> => {
  try {
    // First check if the table exists to avoid errors
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('developer_permissions')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (tableCheckError) {
      // Table doesn't exist, so we can't check permissions
      console.error('Error checking developer role:', tableCheckError);
      return false;
    }
    
    // Check if user has developer permissions
    const { data, error } = await supabase
      .from('developer_permissions')
      .select('is_developer')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking developer permissions:', error);
      return false;
    }
    
    return data?.is_developer || false;
  } catch (error) {
    console.error('Error checking developer role:', error);
    return false;
  }
};

export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  try {
    // Check if developer_settings table exists
    const { data, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking developer mode:', error);
      return false;
    }
    
    return data?.is_enabled || false;
  } catch (error) {
    console.error('Error checking developer mode:', error);
    return false;
  }
};

export const toggleDeveloperMode = async (userId: string, isEnabled: boolean): Promise<boolean> => {
  try {
    // Check if the user has a developer_settings record
    const { data: existing, error: checkError } = await supabase
      .from('developer_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking developer settings:', checkError);
      return false;
    }
    
    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('developer_settings')
        .update({ is_enabled: isEnabled })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating developer mode:', error);
        return false;
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('developer_settings')
        .insert({
          user_id: userId,
          is_enabled: isEnabled,
          cache_time_minutes: 5,
          update_interval_seconds: 30,
          debug_level: 'info',
          realtime_enabled: false,
          show_toolbar: true
        });
      
      if (error) {
        console.error('Error creating developer settings:', error);
        return false;
      }
    }
    
    toast.success(isEnabled ? 'تم تفعيل وضع المطور' : 'تم تعطيل وضع المطور');
    return true;
  } catch (error) {
    console.error('Error toggling developer mode:', error);
    return false;
  }
};

export const initializeDeveloperRole = async (userId: string): Promise<boolean> => {
  try {
    // Check if developer_permissions table exists
    const { error: tableCheckError } = await supabase.rpc('check_table_exists', { 
      table_name: 'developer_permissions' 
    });
    
    if (tableCheckError) {
      console.error('Developer permissions functionality is not configured:', tableCheckError);
      toast.error('تعذر تهيئة صلاحيات المطور');
      return false;
    }
    
    // Check if the user already has a record
    const { data: existingRecord, error: recordCheckError } = await supabase
      .from('developer_permissions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (recordCheckError) {
      console.error('Error checking existing developer record:', recordCheckError);
      return false;
    }
    
    // If user doesn't have a record, create one
    if (!existingRecord) {
      const { error: insertError } = await supabase
        .from('developer_permissions')
        .insert({
          user_id: userId,
          is_developer: false,
          permissions: {
            canAccessDeveloperTools: false,
            canModifySystemSettings: false,
            canAccessApiLogs: false,
            canManageDeveloperSettings: false,
            canViewPerformanceMetrics: false,
            canDebugQueries: false,
            canManageRealtime: false,
            canAccessAdminPanel: false,
            canExportData: false,
            canImportData: false
          }
        });
      
      if (insertError) {
        console.error('Error initializing developer role:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing developer role:', error);
    return false;
  }
};
