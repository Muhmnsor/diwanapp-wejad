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
    // تسجيل حالة اتصال Supabase قبل الاستدعاء
    console.log('فحص حالة اتصال Supabase...');
    const { data: healthCheck, error: healthError } = await supabase.rpc('version');
    console.log('نتيجة فحص الاتصال:', healthCheck, healthError);
    
    // استدعاء وظيفة RPC مع توضيح المزيد من المعلومات للتصحيح
    console.log('استدعاء وظيفة assign_user_role...');
    const { data: roleData, error: roleError } = await supabase.rpc('assign_user_role', {
      p_user_id: userId,
      p_role_id: roleId
    });
    
    if (roleError) {
      console.error('خطأ في تعيين الدور الجديد:', roleError);
      console.error('تفاصيل الخطأ:', JSON.stringify(roleError));
      console.error('رمز الخطأ:', roleError.code);
      console.error('رسالة الخطأ:', roleError.message);
      console.error('تفاصيل إضافية:', roleError.details);
      
      // محاولة تعيين الدور يدويًا إذا فشلت وظيفة RPC
      console.log('محاولة تعيين الدور يدويًا بعد فشل RPC...');
      const manualResult = await assignUserRoleManually(userId, roleId);
      return manualResult;
    } else {
      console.log('نتيجة استدعاء وظيفة assign_user_role:', roleData);
      console.log('تم تعيين الدور الجديد بنجاح');
      return true;
    }
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
    const { data: deleteRoleData, error: deleteRoleError } = await supabase.rpc('delete_user_roles', {
      p_user_id: userId
    });
    
    if (deleteRoleError) {
      console.error('خطأ في حذف أدوار المستخدم باستخدام RPC:', deleteRoleError);
      console.error('تفاصيل الخطأ:', JSON.stringify(deleteRoleError));
      
      // استخدام الطريقة اليدوية كبديل
      const { error: manualDeleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
        
      if (manualDeleteError) {
        console.error('خطأ في حذف الأدوار يدويًا:', manualDeleteError);
        return false;
      }
      
      console.log('تم حذف أدوار المستخدم يدويًا بنجاح');
      return true;
    } else {
      console.log('نتيجة استدعاء وظيفة delete_user_roles:', deleteRoleData);
      console.log('تم حذف أدوار المستخدم بنجاح');
      return true;
    }
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
