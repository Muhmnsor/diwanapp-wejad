
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
