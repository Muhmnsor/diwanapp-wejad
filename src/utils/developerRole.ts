
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * وظيفة للتحقق من وجود دور المطور وإنشاءه إذا لم يكن موجوداً
 */
export const initializeDeveloperRole = async () => {
  try {
    // التحقق من وجود دور المطور
    const { data: developerRole, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .maybeSingle();
      
    if (error) {
      console.error("Error checking for developer role:", error);
      return;
    }
    
    // إذا كان دور المطور غير موجود، قم بإنشائه
    if (!developerRole) {
      const { error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'دور مخصص للمطورين مع صلاحيات كاملة للنظام'
        });
        
      if (createError) {
        console.error("Error creating developer role:", createError);
        return;
      }
      
      console.log("Developer role created successfully");
      
      // الحصول على معرف دور المطور الجديد
      const { data: newRole, error: getError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'developer')
        .single();
        
      if (getError || !newRole) {
        console.error("Error getting new developer role ID:", getError);
        return;
      }
      
      // إضافة جميع الصلاحيات لدور المطور
      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('id');
        
      if (permissionsError) {
        console.error("Error getting permissions:", permissionsError);
        return;
      }
      
      const rolePermissions = permissions.map(p => ({
        role_id: newRole.id,
        permission_id: p.id
      }));
      
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);
        
      if (insertError) {
        console.error("Error assigning permissions to developer role:", insertError);
        return;
      }
      
      console.log("Developer role permissions assigned successfully");
    }
  } catch (error) {
    console.error("Error in initializeDeveloperRole:", error);
  }
};
