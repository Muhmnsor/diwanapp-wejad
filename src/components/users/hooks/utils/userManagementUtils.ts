
import { supabase } from "@/integrations/supabase/client";

/**
 * Logs a user activity
 */
export const logUserActivity = async (userId: string, activityType: string, details: string) => {
  try {
    await supabase.rpc('log_user_activity', {
      user_id: userId,
      activity_type: activityType,
      details
    });
  } catch (error) {
    console.error('خطأ في تسجيل نشاط المستخدم:', error);
  }
};

/**
 * Deletes a user using Supabase Functions
 */
export const deleteUser = async (userId: string) => {
  const { error } = await supabase.functions.invoke('manage-users', {
    body: {
      operation: 'delete_user',
      userId
    }
  });

  if (error) {
    console.error('خطأ في حذف المستخدم:', error);
    throw error;
  }
};
