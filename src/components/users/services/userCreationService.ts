
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UserCreationData {
  username: string;
  password: string;
  displayName?: string;
  roleId: string;
}

export const createUser = async (userData: UserCreationData): Promise<string | null> => {
  console.log("=== بدء عملية إنشاء مستخدم جديد ===");
  console.log("البريد الإلكتروني:", userData.username);
  console.log("الاسم الشخصي:", userData.displayName || "غير محدد");
  console.log("الدور المحدد:", userData.roleId);
  
  try {
    // 1. إنشاء المستخدم في نظام المصادقة
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.username,
      password: userData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: userData.displayName || null
        }
      }
    });
    
    if (authError) {
      console.error("خطأ في إنشاء المستخدم:", authError);
      throw authError;
    }
    
    console.log("تم إنشاء المستخدم بنجاح:", authData.user.id);
    const userId = authData.user.id;
    
    // 2. تحديث الاسم الشخصي إذا تم إدخاله
    if (userData.displayName) {
      console.log("تحديث الاسم الشخصي...");
      const { error: displayNameError } = await supabase
        .from('profiles')
        .update({ display_name: userData.displayName })
        .eq('id', userId);
        
      if (displayNameError) {
        console.error("خطأ في تحديث الاسم الشخصي:", displayNameError);
        console.warn("تم تجاوز خطأ تحديث الاسم الشخصي واستكمال العملية");
      } else {
        console.log("تم تحديث الاسم الشخصي بنجاح");
      }
    }
    
    // 3. تعيين دور للمستخدم
    console.log("تعيين دور للمستخدم...");
    const { error: roleError } = await supabase.rpc('assign_user_role', {
      p_user_id: userId,
      p_role_id: userData.roleId,
    });
    
    if (roleError) {
      console.error("خطأ في تعيين الدور:", roleError);
      throw roleError;
    }
    
    console.log("تم تعيين الدور بنجاح");
    
    // 4. تسجيل نشاط إنشاء المستخدم
    await supabase.rpc('log_user_activity', {
      user_id: userId,
      activity_type: 'user_created',
      details: `تم إنشاء المستخدم (البريد: ${userData.username}, الدور: ${userData.roleId}, الاسم الشخصي: ${userData.displayName || 'غير محدد'})`
    });
    
    console.log("=== تمت عملية إنشاء المستخدم بنجاح ===");
    return userId;
  } catch (error) {
    console.error("خطأ عام في إنشاء المستخدم:", error);
    throw error;
  }
};
