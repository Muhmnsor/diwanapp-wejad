
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../../types";

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

/**
 * Assigns a role to a user using the RPC function
 */
export const assignUserRole = async (userId: string, roleId: string): Promise<boolean> => {
  if (!userId || !roleId) {
    console.error('خطأ: معرف المستخدم أو معرف الدور غير موجود', { userId, roleId });
    return false;
  }
  
  console.log('استدعاء وظيفة assign_user_role مع المعلمات:', {
    p_user_id: userId,
    p_role_id: roleId
  });
  
  try {
    // تحقق مباشر من قاعدة البيانات قبل التغيير
    console.log('التحقق من أدوار المستخدم الحالية قبل التغيير...');
    const { data: currentRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('خطأ في التحقق من الأدوار الحالية:', checkError);
    } else {
      console.log('أدوار المستخدم الحالية:', currentRoles);
    }
    
    // حذف جميع الأدوار الحالية للمستخدم أولاً قبل إضافة دور جديد
    console.log('حذف الأدوار الحالية للمستخدم...');
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('خطأ في حذف الأدوار الحالية:', deleteError);
      throw deleteError;
    }
    
    console.log('تم حذف الأدوار الحالية بنجاح، إضافة الدور الجديد...');
    
    // إضافة الدور الجديد مباشرة إلى الجدول بدلاً من استخدام وظيفة RPC
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })
      .select();
      
    if (insertError) {
      console.error('خطأ في إضافة الدور الجديد:', insertError);
      throw insertError;
    }
    
    console.log('تم تعيين الدور الجديد بنجاح:', insertData);
    
    // التحقق من تحديث الدور
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_roles')
      .select('*, roles:role_id(id, name)')
      .eq('user_id', userId);
      
    if (verifyError) {
      console.error('خطأ في التحقق من تحديث الدور:', verifyError);
    } else {
      console.log('تحقق من أدوار المستخدم بعد التحديث:', verifyData);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ عام في تعيين الدور:', error);
    return false;
  }
};

/**
 * Fallback manual role assignment method
 */
export const assignUserRoleManually = async (userId: string, roleId: string): Promise<boolean> => {
  console.log('بدء عملية تعيين الدور يدويًا...');
  console.log('معرف المستخدم:', userId);
  console.log('معرف الدور:', roleId);
  
  try {
    // Delete existing roles first
    console.log('حذف الأدوار الحالية أولاً...');
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('خطأ في حذف الأدوار الحالية:', deleteError);
      return false;
    }
    
    console.log('تم حذف الأدوار الحالية بنجاح');
    
    // Add the new role
    console.log('إضافة الدور الجديد...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });
      
    if (insertError) {
      console.error('خطأ في إضافة الدور الجديد:', insertError);
      console.error('تفاصيل الخطأ:', JSON.stringify(insertError));
      return false;
    }
    
    console.log('نتيجة إدراج الدور:', insertData);
    console.log('تم تعيين الدور يدويًا بنجاح');
    
    // التحقق من تحديث الدور
    await verifyUserRoles(userId);
    
    return true;
  } catch (error) {
    console.error('خطأ عام في تعيين الدور يدويًا:', error);
    return false;
  }
};

/**
 * Deletes all roles for a user
 */
export const deleteUserRoles = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('خطأ: معرف المستخدم غير موجود');
    return false;
  }
  
  console.log('حذف جميع أدوار المستخدم...', userId);
  
  try {
    // حذف الأدوار مباشرة من جدول user_roles بدلاً من استخدام RPC
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('خطأ في حذف أدوار المستخدم:', deleteError);
      return false;
    }
    
    console.log('تم حذف أدوار المستخدم بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ عام في حذف أدوار المستخدم:', error);
    return false;
  }
};

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

/**
 * Verifies user roles after update for debugging
 */
export const verifyUserRoles = async (userId: string) => {
  console.log('بدء التحقق من أدوار المستخدم بعد التحديث...');
  
  // Check roles after update
  const { data: userRolesAfter, error: rolesCheckError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);
    
  if (rolesCheckError) {
    console.error('خطأ في التحقق من الأدوار بعد التحديث:', rolesCheckError);
  } else {
    console.log('أدوار المستخدم بعد التحديث:', userRolesAfter);
    if (userRolesAfter && userRolesAfter.length === 0) {
      console.warn('لم يتم العثور على أدوار للمستخدم بعد التحديث!');
    }
  }
  
  // Log user roles with role information
  const { data: userRolesWithName, error: rolesNameError } = await supabase
    .from('user_roles')
    .select('user_id, role_id, roles:role_id(id, name, description)')
    .eq('user_id', userId);
    
  if (rolesNameError) {
    console.error('خطأ في جلب معلومات الدور الكاملة:', rolesNameError);
  } else {
    console.log('معلومات دور المستخدم الكاملة بعد التحديث:', userRolesWithName);
    if (userRolesWithName && userRolesWithName.length === 0) {
      console.warn('لم يتم العثور على معلومات دور للمستخدم بعد التحديث!');
    }
  }
  
  // Check auth.users table constraints
  try {
    const { data: userDetails, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.error('خطأ في التحقق من بيانات المستخدم في جدول auth.users:', userError);
    } else {
      console.log('بيانات المستخدم في auth.users:', userDetails);
    }
  } catch (error) {
    console.log('غير قادر على الوصول إلى بيانات auth.users:', error);
  }
};
