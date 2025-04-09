
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
    // استدعاء Edge Function لإنشاء المستخدم
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        operation: 'create_user',
        username: userData.username,
        password: userData.password,
        displayName: userData.displayName,
        roleId: userData.roleId
      }
    });
    
    if (error) {
      console.error("خطأ في استدعاء دالة إنشاء المستخدم:", error);
      throw error;
    }
    
    console.log("استجابة إنشاء المستخدم:", data);
    
    if (!data.success) {
      console.error("فشل في إنشاء المستخدم:", data.error || "خطأ غير معروف");
      throw new Error(data.error || "فشل في إنشاء المستخدم");
    }
    
    console.log("=== تمت عملية إنشاء المستخدم بنجاح ===");
    return data.userId;
  } catch (error) {
    console.error("خطأ عام في إنشاء المستخدم:", error);
    throw error;
  }
};
