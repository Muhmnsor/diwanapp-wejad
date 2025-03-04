import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export const useUserOperations = (onUserUpdated: () => void) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      console.log("=== بدء عملية تحديث المستخدم ===");
      
      // تحديث كلمة المرور إذا تم إدخالها
      if (newPassword) {
        const response = await supabase.functions.invoke('manage-users', {
          body: JSON.stringify({
            operation: 'update_password',
            userId: selectedUser.id,
            newPassword: newPassword
          })
        });

        if (response.error) {
          throw response.error;
        }
      }
      
      // تحديث الدور إذا تم تحديده
      if (selectedRole) {
        const response = await supabase.functions.invoke('manage-users', {
          body: JSON.stringify({
            operation: 'update_role',
            userId: selectedUser.id,
            newRole: selectedRole
          })
        });

        if (response.error) {
          throw response.error;
        }
      }
      
      // تحديث الاسم الشخصي
      const { error: displayNameError } = await supabase
        .from('profiles')
        .update({ display_name: selectedUser.displayName })
        .eq('id', selectedUser.id);
      
      if (displayNameError) {
        throw displayNameError;
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setSelectedUser(null);
      setNewPassword("");
      setSelectedRole("");
      onUserUpdated();
      
    } catch (error) {
      console.error("خطأ في تحديث بيانات المستخدم:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      console.log("=== بدء عملية حذف المستخدم ===");
      console.log("معرف المستخدم:", userToDelete.id);
      
      // استخدام وظيفة الحذف المنطقي بدلاً من الحذف الفعلي
      const { data, error } = await supabase.rpc('soft_delete_user', {
        user_id: userToDelete.id
      });
      
      if (error) {
        console.error("خطأ في تنفيذ الحذف المنطقي للمستخدم:", error);
        throw error;
      }
      
      if (!data) {
        console.error("فشل تنفيذ الحذف المنطقي: لم يتم إرجاع نتيجة");
        throw new Error("فشل تنفيذ الحذف المنطقي");
      }
      
      toast.success("تم تعطيل المستخدم وإخفاء هويته بنجاح");
      setUserToDelete(null);
      onUserUpdated();
      console.log("=== تمت عملية الحذف المنطقي للمستخدم بنجاح ===");
    } catch (error) {
      console.error("خطأ عام في تنفيذ الحذف المنطقي للمستخدم:", error);
      toast.error("حدث خطأ أثناء تعطيل المستخدم");
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
