
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

      // التحقق من تغيير الدور - سنقوم بمعالجة تغيير الدور حتى لو كان selectedRole فارغًا
      // لأننا نريد حذف أي أدوار حالية في حالة عدم تحديد دور جديد
      console.log('=== تحديث دور المستخدم ===');
      console.log('معرف المستخدم:', selectedUser.id);
      console.log('الدور الحالي:', selectedUser.role || 'لا يوجد');
      console.log('الدور الجديد المحدد:', selectedRole || 'لم يتم تحديد دور');
      
      try {
        // أولاً، نحذف أي أدوار سابقة
        console.log('حذف الأدوار السابقة...');
        const { error: deleteError } = await supabase.rpc('delete_user_roles', {
          p_user_id: selectedUser.id
        });
          
        if (deleteError) {
          console.error('خطأ في حذف الأدوار السابقة:', deleteError);
          throw deleteError;
        }
        
        console.log('تم حذف الأدوار السابقة بنجاح');
        
        // إضافة الدور الجديد إذا تم تحديده
        if (selectedRole) {
          console.log('إضافة الدور الجديد:', selectedRole);
          
          const { error: assignError } = await supabase.rpc('assign_user_role', {
            p_user_id: selectedUser.id,
            p_role_id: selectedRole
          });
              
          if (assignError) {
            console.error('خطأ في إضافة الدور الجديد:', assignError);
            throw assignError;
          }
          
          console.log('تم إضافة الدور الجديد بنجاح');
          
          // Log user activity for role change
          await supabase.rpc('log_user_activity', {
            user_id: selectedUser.id,
            activity_type: 'role_change',
            details: `تم تغيير الدور إلى ${selectedRole}`
          });
          
          console.log('تم تسجيل نشاط تغيير الدور');
        } else {
          // إذا لم يتم تحديد دور جديد، نسجل أنه تم إزالة الدور الحالي
          console.log('تم إزالة الدور من المستخدم (لم يتم تحديد دور جديد)');
          if (selectedUser.role) {
            await supabase.rpc('log_user_activity', {
              user_id: selectedUser.id,
              activity_type: 'role_change',
              details: 'تم إزالة الدور من المستخدم'
            });
          }
        }
      } catch (error) {
        console.error('خطأ أثناء تحديث الدور:', error);
        toast.error("حدث خطأ أثناء تحديث الدور");
        throw error;
      }

      if (newPassword) {
        // Log password change activity
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
      onUserDeleted(); // Refresh the users list
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
      
      // Log user deletion activity before deleting the user
      await supabase.rpc('log_user_activity', {
        user_id: userToDelete.id,
        activity_type: 'user_deleted',
        details: `تم حذف المستخدم ${userToDelete.username}`
      });
      console.log('تم تسجيل نشاط حذف المستخدم');

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
