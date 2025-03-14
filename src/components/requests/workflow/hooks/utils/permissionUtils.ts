
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has permissions to manage workflows
 * @returns Object with session and admin status
 */
export const checkUserPermissions = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log("No authenticated session found");
    return { session: null, isAdmin: false };
  }
  
  // Check if user is admin
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error("Error checking user permissions:", userError);
      return { session, isAdmin: false };
    }
    
    const isAdmin = userData?.is_admin || 
                  userData?.role === 'admin' ||
                  userData?.role === 'developer';
    
    return { session, isAdmin };
  } catch (error) {
    console.error("Exception checking user permissions:", error);
    return { session, isAdmin: false };
  }
};
