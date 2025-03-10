
import { supabase } from "@/integrations/supabase/client";

export async function checkUserPermissions() {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { session: null, isAdmin: false };
  }

  // Check if user has admin role
  const { data: userRoles, error: roleError } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', session.user.id);
    
  if (roleError) {
    console.error("Error checking user roles:", roleError);
    return { session, isAdmin: false };
  }
  
  const isAdmin = userRoles?.some(role => {
    if (role.roles) {
      const roleName = Array.isArray(role.roles) 
        ? (role.roles[0]?.name) 
        : (role.roles as any).name;
      return roleName === 'admin' || roleName === 'app_admin';
    }
    return false;
  });

  return { session, isAdmin };
}
