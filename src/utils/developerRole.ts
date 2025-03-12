
import { supabase } from "@/integrations/supabase/client";
import { initializePermissionsSystem } from "./permissions/permissionsSeeder";

/**
 * Initialize developer role and permissions system
 */
export const initializeDeveloperRole = async () => {
  try {
    // Check if developer role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'developer')
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking for developer role:', roleError);
      return;
    }
    
    // If developer role doesn't exist, create it
    if (!existingRole) {
      console.log('Developer role does not exist, creating...');
      
      const { error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'دور المطور مع صلاحيات للوصول إلى أدوات التطوير والإعدادات المتقدمة'
        });
        
      if (createError) {
        console.error('Error creating developer role:', createError);
        return;
      }
      
      console.log('Developer role created successfully');
    }
    
    // Initialize permissions system
    await initializePermissionsSystem();
    
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
  }
};
