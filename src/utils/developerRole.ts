
import { supabase } from "@/integrations/supabase/client";

// Initialize standard roles in the system
export const initializeDeveloperRole = async () => {
  try {
    // Check if developer role exists
    const { data: existingRoles, error: checkError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'developer');
    
    if (checkError) {
      console.error("Error checking for developer role:", checkError);
      return;
    }
    
    // If developer role doesn't exist, create it
    if (!existingRoles || existingRoles.length === 0) {
      const { error: insertError } = await supabase
        .from('roles')
        .insert([
          { 
            name: 'developer',
            description: 'Full access to all system features and developer tools'
          }
        ]);
      
      if (insertError) {
        console.error("Error creating developer role:", insertError);
      } else {
        console.log("Developer role created successfully");
      }
    } else {
      console.log("Developer role already exists");
    }

    // Check if admin role exists
    const { data: adminRoles, error: adminCheckError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'admin');
    
    if (adminCheckError) {
      console.error("Error checking for admin role:", adminCheckError);
      return;
    }
    
    // If admin role doesn't exist, create it
    if (!adminRoles || adminRoles.length === 0) {
      const { error: insertAdminError } = await supabase
        .from('roles')
        .insert([
          { 
            name: 'admin',
            description: 'Access to system administration features'
          }
        ]);
      
      if (insertAdminError) {
        console.error("Error creating admin role:", insertAdminError);
      } else {
        console.log("Admin role created successfully");
      }
    }
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};
