
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export const useUserOperations = (onUserDeleted: () => void) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
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

      // تحديث دور المستخدم باستخدام وظيفة RPC
      if (selectedRole) {
        console.log('تعيين الدور الجديد:', selectedRole);
        
        // تسجيل محاولة استدعاء وظيفة تعيين الدور
        console.log('استدعاء وظيفة assign_user_role مع المعلمات:', {
          p_user_id: selectedUser.id,
          p_role_id: selectedRole
        });
        
        const { data: roleData, error: roleError } = await supabase.rpc('assign_user_role', {
          p_user_id: selectedUser.id,
          p_role_id: selectedRole
        });
            
        if (roleError) {
          console.error('خطأ في تعيين الدور الجديد:', roleError);
          console.error('تفاصيل الخطأ:', JSON.stringify(roleError));
          throw roleError;
        }
        
        console.log('نتيجة استدعاء وظيفة assign_user_role:', roleData);
        console.log('تم تعيين الدور الجديد بنجاح');
        
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
        
        // تسجيل نشاط تغيير الدور
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'role_change',
          details: `تم تغيير الدور`
        });
      } else {
        // إذا لم يتم تحديد دور، نقوم بحذف جميع الأدوار
        console.log('حذف جميع أدوار المستخدم...');
        const { data: deleteRoleData, error: deleteRoleError } = await supabase.rpc('delete_user_roles', {
          p_user_id: selectedUser.id
        });
        
        if (deleteRoleError) {
          console.error('خطأ في حذف أدوار المستخدم:', deleteRoleError);
          console.error('تفاصيل الخطأ:', JSON.stringify(deleteRoleError));
          throw deleteRoleError;
        }
        
        console.log('نتيجة استدعاء وظيفة delete_user_roles:', deleteRoleData);
        console.log('تم حذف أدوار المستخدم بنجاح');
        
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
      setSelectedRole("");
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
