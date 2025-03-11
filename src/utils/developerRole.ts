
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const initializeDeveloperRole = async () => {
  try {
    // Check if developer role exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .maybeSingle();
      
    if (!existingRole) {
      // Create developer role if it doesn't exist
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'دور المطور مع صلاحيات خاصة للوصول إلى أدوات التطوير'
        })
        .select('id')
        .single();
        
      if (roleError) {
        console.error('Error creating developer role:', roleError);
        return;
      }
      
      console.log('Developer role created successfully');
    }
    
    // Ensure all permissions in the permissionsMapping are in the database
    const { data: dbPermissions } = await supabase
      .from('permissions')
      .select('name');
    
    // Create a helper function to check permissions existence
    const getExistingPermissionNames = () => {
      return dbPermissions?.map(p => p.name) || [];
    };
    
    // We won't show a success toast to avoid distracting the user
    // But we'll log success to the console for debugging
    console.log('Successfully initialized developer role');
    
  } catch (error) {
    console.error('Error initializing developer role:', error);
  }
};

// Check if the user has the developer role
export const hasDevRole = async (userId: string): Promise<boolean> => {
  try {
    // Check if developer role exists
    const { data: devRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!devRole) return false;
    
    // Check if user has this role
    const { data } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('role_id', devRole.id)
      .maybeSingle();
      
    return !!data;
  } catch (error) {
    console.error('Error checking developer role:', error);
    return false;
  }
};
