
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const isDeveloper = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Check for admin status through user_roles, not in profiles table
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', userId);
      
    // Check if user has admin role
    const isAdmin = userRoles?.some(role => 
      role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
    );
    
    if (isAdmin) {
      console.log('User is admin, granting developer access automatically');
      return true;
    }
    
    // Check if developer role exists
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!developerRole?.id) {
      console.log('Developer role does not exist');
      return false;
    }
    
    // Check if user has developer role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id')
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

export const assignDeveloperRole = async (userId: string): Promise<boolean> => {
  try {
    // Get developer role ID
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!developerRole?.id) {
      toast.error('دور المطور غير موجود');
      return false;
    }
    
    // Check if already assigned - FIXED: don't try to access 'id' column
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('role_id', developerRole.id)
      .maybeSingle();
      
    if (existingRole) {
      return true; // Already assigned
    }
    
    // Assign role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: developerRole.id
      });
      
    if (error) {
      console.error('Error assigning developer role:', error);
      toast.error('فشل في تعيين دور المطور');
      return false;
    }
    
    toast.success('تم تعيين دور المطور بنجاح');
    return true;
  } catch (error) {
    console.error('Error in assignDeveloperRole:', error);
    toast.error('حدث خطأ أثناء تعيين دور المطور');
    return false;
  }
};

export const removeDeveloperRole = async (userId: string): Promise<boolean> => {
  try {
    // Get developer role ID
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!developerRole?.id) {
      toast.error('دور المطور غير موجود');
      return false;
    }
    
    // Remove role assignment
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', developerRole.id);
      
    if (error) {
      console.error('Error removing developer role:', error);
      toast.error('فشل في إزالة دور المطور');
      return false;
    }
    
    toast.success('تم إزالة دور المطور بنجاح');
    return true;
  } catch (error) {
    console.error('Error in removeDeveloperRole:', error);
    toast.error('حدث خطأ أثناء إزالة دور المطور');
    return false;
  }
};
