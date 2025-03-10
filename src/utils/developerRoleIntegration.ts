
import { supabase } from "@/integrations/supabase/client";
import { setupDefaultDeveloperPermissions } from "@/components/users/permissions/utils/developerPermissionUtils";
import { toast } from "sonner";

/**
 * دالة للتحقق من وجود دور المطور وإنشائه إذا لم يكن موجوداً
 */
export const ensureDeveloperRole = async (): Promise<string | null> => {
  try {
    // التحقق من وجود دور المطور
    const { data: existingRole, error: fetchError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking developer role:', fetchError);
      return null;
    }

    // إذا كان الدور موجوداً، نعيد معرّفه
    if (existingRole?.id) {
      return existingRole.id;
    }

    // إنشاء دور المطور إذا لم يكن موجوداً
    const { data: newRole, error: insertError } = await supabase
      .from('roles')
      .insert({
        name: 'developer',
        description: 'دور المطور مع صلاحيات للوصول إلى أدوات التطوير وإعدادات النظام'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating developer role:', insertError);
      return null;
    }

    return newRole?.id || null;
  } catch (error) {
    console.error('Unexpected error in ensureDeveloperRole:', error);
    return null;
  }
};

/**
 * دالة لتعيين دور المطور للمستخدم
 */
export const assignDeveloperRole = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('Invalid user ID');
      return false;
    }

    // الحصول على معرّف دور المطور أو إنشائه
    const developerRoleId = await ensureDeveloperRole();
    
    if (!developerRoleId) {
      toast.error('فشل في الحصول على دور المطور');
      return false;
    }

    // التحقق مما إذا كان المستخدم لديه بالفعل دور المطور
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', developerRoleId)
      .single();

    if (existingRole?.id) {
      // المستخدم لديه بالفعل دور المطور
      return true;
    }

    // تعيين دور المطور للمستخدم
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: developerRoleId
      });

    if (error) {
      console.error('Error assigning developer role:', error);
      toast.error('فشل في تعيين دور المطور');
      return false;
    }

    // إعداد أذونات المطور الافتراضية
    await setupDefaultDeveloperPermissions(developerRoleId);
    
    toast.success('تم تعيين دور المطور بنجاح');
    return true;
  } catch (error) {
    console.error('Error in assignDeveloperRole:', error);
    toast.error('حدث خطأ أثناء تعيين دور المطور');
    return false;
  }
};

/**
 * دالة لإزالة دور المطور من المستخدم
 */
export const removeDeveloperRole = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('Invalid user ID');
      return false;
    }

    // الحصول على معرّف دور المطور
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (!developerRole?.id) {
      // إذا لم يكن دور المطور موجوداً، فلا حاجة لإزالته
      return true;
    }

    // إزالة دور المطور من المستخدم
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
