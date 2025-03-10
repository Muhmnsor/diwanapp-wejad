
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    
    // Check if already assigned
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', developerRole.id)
      .single();
      
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
