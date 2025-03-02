
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
      console.log('الدور المحدد:', selectedRole);
      console.log('تم تقديم كلمة مرور جديدة:', newPassword ? 'نعم' : 'لا');

      // تحديث كلمة المرور إذا تم تقديمها
      if (newPassword) {
        console.log('محاولة تحديث كلمة المرور...');
        const { data: passwordData, error: passwordError } = await supabase.functions.invoke('manage-users', {
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

      // تحديث الدور - تحقق أولاً مما إذا كان الدور قد تغير
      if (selectedRole !== selectedUser.roleId) {
        console.log('=== تحديث دور المستخدم ===');
        console.log('معرف المستخدم:', selectedUser.id);
        console.log('الدور الحالي:', selectedUser.roleId);
        console.log('معرف الدور الجديد المحدد:', selectedRole);
        
        try {
          // حذف الأدوار الحالية أولاً
          await supabase.rpc('delete_user_roles', {
            p_user_id: selectedUser.id
          });
          
          console.log('تم حذف الأدوار الحالية');
          
          // إذا تم تحديد دور جديد، قم بتعيينه
          if (selectedRole) {
            const { data: roleData, error: roleAssignError } = await supabase.rpc('assign_user_role', {
              p_user_id: selectedUser.id,
              p_role_id: selectedRole
            });
            
            if (roleAssignError) {
              console.error('خطأ في تعيين الدور الجديد:', roleAssignError);
              throw roleAssignError;
            }
            
            console.log('تم تعيين الدور الجديد:', selectedRole);
          }
          
          // تسجيل نشاط تغيير الدور
          await supabase.rpc('log_user_activity', {
            user_id: selectedUser.id,
            activity_type: 'role_change',
            details: `تم تغيير الدور إلى ${selectedRole}`
          });
          
          console.log('تم تسجيل نشاط تغيير الدور');
        } catch (error) {
          console.error('خطأ أثناء تحديث الدور:', error);
          toast.error("حدث خطأ أثناء تحديث الدور");
          throw error;
        }
      }

      if (newPassword) {
        // تسجيل نشاط تغيير كلمة المرور
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'password_change',
          details: 'تم تغيير كلمة المرور'
        });
        console.log('تم تسجيل نشاط تغيير كلمة المرور');
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setSelectedUser(null);
      setNewPassword("");
      setSelectedRole("");
      onUserDeleted(); // تحديث قائمة المستخدمين
      console.log('=== انتهت عملية تحديث المستخدم بنجاح ===');
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
      
      // تسجيل نشاط حذف المستخدم
      await supabase.rpc('log_user_activity', {
        user_id: userToDelete.id,
        activity_type: 'user_deleted',
        details: `تم حذف المستخدم ${userToDelete.username}`
      });
      console.log('تم تسجيل نشاط حذف المستخدم');

      // استخدام وظيفة Edge Function لحذف المستخدم
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          operation: 'delete_user',
          userId: userToDelete.id
        }
      });

      if (error) {
        console.error('خطأ في حذف المستخدم:', error);
        throw error;
      }

      console.log('استجابة حذف المستخدم:', data);
      console.log('تم حذف المستخدم بنجاح');
      toast.success("تم حذف المستخدم بنجاح");
      onUserDeleted();
      console.log('=== انتهت عملية حذف المستخدم بنجاح ===');
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
