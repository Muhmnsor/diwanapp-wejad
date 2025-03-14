
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Checks if the current user has admin permissions
 * @returns Object containing session, isAdmin status, and error if any
 */
export const checkUserPermissions = async () => {
  try {
    // Get the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      toast.error("يجب تسجيل الدخول لإدارة سير العمل");
      return { session: null, isAdmin: false };
    }
    
    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', data.session.user.id);
      
    if (roleError) {
      console.error("Error checking user roles:", roleError);
      toast.error("حدث خطأ في التحقق من صلاحيات المستخدم");
      return { session: data.session, isAdmin: false };
    }
    
    // Check if user has admin or app_admin role
    const isAdmin = userRoles?.some(role => {
      const roleName = Array.isArray(role.roles) 
        ? (role.roles[0]?.name) 
        : (role.roles as any).name;
      
      return roleName === 'admin' || roleName === 'app_admin';
    });
    
    return { session: data.session, isAdmin };
  } catch (error) {
    console.error("Error in checkUserPermissions:", error);
    toast.error("حدث خطأ في التحقق من صلاحيات المستخدم");
    return { session: null, isAdmin: false };
  }
};
