
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
export const assignUserRole = async (userId: string, roleId: string) => {
  console.log('استدعاء وظيفة assign_user_role مع المعلمات:', {
    p_user_id: userId,
    p_role_id: roleId
  });
  
  const { data: roleData, error: roleError } = await supabase.rpc('assign_user_role', {
    p_user_id: userId,
    p_role_id: roleId
  });
      
  if (roleError) {
    console.error('خطأ في تعيين الدور الجديد:', roleError);
    console.error('تفاصيل الخطأ:', JSON.stringify(roleError));
    
    // Fallback manual role assignment if RPC fails
    await assignUserRoleManually(userId, roleId);
  } else {
    console.log('نتيجة استدعاء وظيفة assign_user_role:', roleData);
    console.log('تم تعيين الدور الجديد بنجاح');
  }
};

/**
 * Fallback manual role assignment method
 */
export const assignUserRoleManually = async (userId: string, roleId: string) => {
  console.log('محاولة تعيين الدور يدويًا...');
  
  // Delete existing roles first
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
    
  if (deleteError) {
    console.error('خطأ في حذف الأدوار الحالية:', deleteError);
    throw deleteError;
  }
  
  // Add the new role
  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role_id: roleId });
    
  if (insertError) {
    console.error('خطأ في إضافة الدور الجديد:', insertError);
    throw insertError;
  }
  
  console.log('تم تعيين الدور يدويًا بنجاح');
};

/**
 * Deletes all roles for a user
 */
export const deleteUserRoles = async (userId: string) => {
  console.log('لم يتم تحديد دور، إزالة جميع الأدوار...');
  const { data: deleteRoleData, error: deleteRoleError } = await supabase.rpc('delete_user_roles', {
    p_user_id: userId
  });
  
  if (deleteRoleError) {
    console.error('خطأ في حذف أدوار المستخدم:', deleteRoleError);
    console.error('تفاصيل الخطأ:', JSON.stringify(deleteRoleError));
    
    // Manual fallback
    const { error: manualDeleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (manualDeleteError) {
      console.error('خطأ في حذف الأدوار يدويًا:', manualDeleteError);
      throw manualDeleteError;
    }
    
    console.log('تم حذف أدوار المستخدم يدويًا بنجاح');
  } else {
    console.log('نتيجة استدعاء وظيفة delete_user_roles:', deleteRoleData);
    console.log('تم حذف أدوار المستخدم بنجاح');
  }
};

/**
 * Logs a user activity
 */
export const logUserActivity = async (userId: string, activityType: string, details: string) => {
  await supabase.rpc('log_user_activity', {
    user_id: userId,
    activity_type: activityType,
    details
  });
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
  // Check roles after update
  const { data: userRolesAfter, error: rolesCheckError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);
    
  if (rolesCheckError) {
    console.error('خطأ في التحقق من الأدوار بعد التحديث:', rolesCheckError);
  } else {
    console.log('أدوار المستخدم بعد التحديث:', userRolesAfter);
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
  }
};
