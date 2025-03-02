
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export const useUserOperations = (onUserDeleted: () => void) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePasswordChange = async () => {
    if (!selectedUser) {
      toast.error("الرجاء تحديد المستخدم");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('=== بدء عملية تحديث المستخدم ===');
      console.log('معرف المستخدم:', selectedUser.id);
      console.log('الدور المحدد:', selectedRole || 'لم يتم تحديد دور جديد');
      console.log('تم تقديم كلمة مرور جديدة:', newPassword ? 'نعم' : 'لا');

      // Handle password change if provided
      if (newPassword) {
        console.log('محاولة تحديث كلمة المرور...');
        const { error: passwordError } = await supabase.functions.invoke('manage-users', {
          body: {
            operation: 'update_password',
            userId: selectedUser.id,
            newPassword
          }
        });

        if (passwordError) {
          console.error('خطأ في تحديث كلمة المرور:', passwordError);
          throw passwordError;
        }
        console.log('تم تحديث كلمة المرور بنجاح');
      }

      // التحقق من وجود دور محدد وأنه ليس فارغًا
      if (selectedRole) {
        console.log('تعيين الدور الجديد:', selectedRole);
        
        // تسجيل محاولة استدعاء وظيفة تعيين الدور
        console.log('استدعاء وظيفة assign_user_role مع المعلمات:', {
          p_user_id: selectedUser.id,
          p_role_id: selectedRole
        });
        
        // محاولة تعيين الدور باستخدام وظيفة قاعدة البيانات
        const { data: roleData, error: roleError } = await supabase.rpc('assign_user_role', {
          p_user_id: selectedUser.id,
          p_role_id: selectedRole
        });
            
        if (roleError) {
          console.error('خطأ في تعيين الدور الجديد:', roleError);
          console.error('تفاصيل الخطأ:', JSON.stringify(roleError));
          
          // محاولة تعيين الدور يدويًا إذا فشلت وظيفة RPC
          console.log('محاولة تعيين الدور يدويًا...');
          
          // حذف الأدوار الحالية أولًا
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', selectedUser.id);
            
          if (deleteError) {
            console.error('خطأ في حذف الأدوار الحالية:', deleteError);
            throw deleteError;
          }
          
          // إضافة الدور الجديد
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: selectedUser.id, role_id: selectedRole });
            
          if (insertError) {
            console.error('خطأ في إضافة الدور الجديد:', insertError);
            throw insertError;
          }
          
          console.log('تم تعيين الدور يدويًا بنجاح');
        } else {
          console.log('نتيجة استدعاء وظيفة assign_user_role:', roleData);
          console.log('تم تعيين الدور الجديد بنجاح');
        }
        
        // تحقق من الأدوار بعد التحديث
        const { data: userRolesAfter, error: rolesCheckError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', selectedUser.id);
          
        if (rolesCheckError) {
          console.error('خطأ في التحقق من الأدوار بعد التحديث:', rolesCheckError);
        } else {
          console.log('أدوار المستخدم بعد التحديث:', userRolesAfter);
        }
        
        // تسجيل أدوار المستخدم مع معلومات الدور كاملة
        const { data: userRolesWithName, error: rolesNameError } = await supabase
          .from('user_roles')
          .select('user_id, role_id, roles:role_id(id, name, description)')
          .eq('user_id', selectedUser.id);
          
        if (rolesNameError) {
          console.error('خطأ في جلب معلومات الدور الكاملة:', rolesNameError);
        } else {
          console.log('معلومات دور المستخدم الكاملة بعد التحديث:', userRolesWithName);
        }
        
        // تسجيل نشاط تغيير الدور
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'role_change',
          details: `تم تغيير الدور`
        });
      } else {
        // إذا لم يتم تحديد دور، نقوم بحذف جميع الأدوار
        console.log('لم يتم تحديد دور، إزالة جميع الأدوار...');
        const { data: deleteRoleData, error: deleteRoleError } = await supabase.rpc('delete_user_roles', {
          p_user_id: selectedUser.id
        });
        
        if (deleteRoleError) {
          console.error('خطأ في حذف أدوار المستخدم:', deleteRoleError);
          console.error('تفاصيل الخطأ:', JSON.stringify(deleteRoleError));
          
          // محاولة حذف الأدوار يدويًا
          const { error: manualDeleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', selectedUser.id);
            
          if (manualDeleteError) {
            console.error('خطأ في حذف الأدوار يدويًا:', manualDeleteError);
            throw manualDeleteError;
          }
          
          console.log('تم حذف أدوار المستخدم يدويًا بنجاح');
        } else {
          console.log('نتيجة استدعاء وظيفة delete_user_roles:', deleteRoleData);
          console.log('تم حذف أدوار المستخدم بنجاح');
        }
        
        // تسجيل نشاط حذف الدور
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'role_change',
          details: 'تم إزالة الدور من المستخدم'
        });
      }

      if (newPassword) {
        // تسجيل نشاط تغيير كلمة المرور
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'password_change',
          details: 'تم تغيير كلمة المرور'
        });
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setSelectedUser(null);
      setNewPassword("");
      setSelectedRole(null);
      onUserDeleted(); // تحديث قائمة المستخدمين
    } catch (error) {
      console.error('خطأ عام في تحديث المستخدم:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      console.log('=== بدء عملية حذف المستخدم ===');
      console.log('معرف المستخدم للحذف:', userToDelete.id);
      
      // تسجيل نشاط حذف المستخدم قبل الحذف
      await supabase.rpc('log_user_activity', {
        user_id: userToDelete.id,
        activity_type: 'user_deleted',
        details: `تم حذف المستخدم ${userToDelete.username}`
      });

      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          operation: 'delete_user',
          userId: userToDelete.id
        }
      });

      if (error) {
        console.error('خطأ في حذف المستخدم:', error);
        throw error;
      }

      toast.success("تم حذف المستخدم بنجاح");
      onUserDeleted();
    } catch (error) {
      console.error('خطأ عام في حذف المستخدم:', error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setUserToDelete(null);
    }
  };

  return {
    selectedUser,
    setSelectedUser,
    userToDelete,
    setUserToDelete,
    userToView,
    setUserToView,
    newPassword,
    setNewPassword,
    selectedRole,
    setSelectedRole,
    isSubmitting,
    handlePasswordChange,
    handleDeleteUser
  };
};
