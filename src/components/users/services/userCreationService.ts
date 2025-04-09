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
    // استخدام Edge Function لإنشاء المستخدم وتعيين الدور بشكل آمن
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        operation: 'create_user',
        email: userData.username,
        password: userData.password,
        displayName: userData.displayName,
        roleId: userData.roleId
      }
    });
    
    if (error) {
      console.error("خطأ في استدعاء Edge Function:", error);
      throw new Error(error.message);
    }
    
    if (!data.success) {
      console.error("فشل في إنشاء المستخدم:", data.error || "سبب غير معروف");
      throw new Error(data.error || "فشل في إنشاء المستخدم لسبب غير معروف");
    }
    
    console.log("تم إنشاء المستخدم بنجاح:", data.userId);
    
    // تسجيل نشاط إنشاء المستخدم
    await supabase.rpc('log_user_activity', {
      user_id: data.userId,
      activity_type: 'user_created',
      details: `تم إنشاء المستخدم (البريد: ${userData.username}, الدور: ${userData.roleId}, الاسم الشخصي: ${userData.displayName || 'غير محدد'})`
    });
    
    console.log("=== تمت عملية إنشاء المستخدم بنجاح ===");
    return data.userId;
  } catch (error) {
    console.error("خطأ عام في إنشاء المستخدم:", error);
    throw error;
  }
};
