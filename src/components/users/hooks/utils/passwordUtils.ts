
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a user's password via Supabase Functions
 */
export const updateUserPassword = async (userId: string, newPassword: string) => {
  console.log('محاولة تحديث كلمة المرور...');
  const { error: passwordError } = await supabase.functions.invoke('manage-users', {
    body: {
      operation: 'update_password',
      userId,
      newPassword
    }
  });

  if (passwordError) {
    console.error('خطأ في تحديث كلمة المرور:', passwordError);
    throw passwordError;
  }
  console.log('تم تحديث كلمة المرور بنجاح');
};
