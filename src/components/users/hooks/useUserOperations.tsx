
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
      console.log("معرف المستخدم:", selectedUser.id);
      console.log("الدور المحدد:", selectedRole);
      console.log("الاسم الشخصي:", selectedUser.displayName);
      console.log("تم إدخال كلمة مرور جديدة:", newPassword ? "نعم" : "لا");
      
      // تحديث الدور والاسم الشخصي
      if (selectedRole) {
        console.log("تحديث دور المستخدم...");
        const { error: roleError } = await supabase.rpc('assign_user_role', {
          p_user_id: selectedUser.id,
          p_role_id: selectedRole,
        });
        
        if (roleError) {
          console.error("خطأ في تعيين الدور:", roleError);
          throw roleError;
        }
        console.log("تم تحديث دور المستخدم بنجاح");
      }
      
      // تحديث الاسم الشخصي إذا كان موجودًا
      if (selectedUser.displayName !== undefined) {
        console.log("تحديث الاسم الشخصي...");
        const { error: displayNameError } = await supabase
          .from('profiles')
          .update({ display_name: selectedUser.displayName })
          .eq('id', selectedUser.id);
        
        if (displayNameError) {
          console.error("خطأ في تحديث الاسم الشخصي:", displayNameError);
          throw displayNameError;
        }
        console.log("تم تحديث الاسم الشخصي بنجاح");
      }
      
      // تحديث كلمة المرور إذا تم إدخالها
      if (newPassword) {
        console.log("تحديث كلمة المرور...");
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { password: newPassword }
        );
        
        if (passwordError) {
          console.error("خطأ في تحديث كلمة المرور:", passwordError);
          throw passwordError;
        }
        console.log("تم تحديث كلمة المرور بنجاح");
      }
      
      // تسجيل النشاط
      await supabase.rpc('log_user_activity', {
        user_id: selectedUser.id,
        activity_type: 'user_updated',
        details: `تم تحديث معلومات المستخدم (الدور: ${selectedRole || 'لم يتغير'}, كلمة المرور: ${newPassword ? 'تم التغيير' : 'لم تتغير'}, الاسم الشخصي: ${selectedUser.displayName || 'لم يتغير'})`
      });
      
      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setSelectedUser(null);
      setNewPassword("");
      setSelectedRole("");
      onUserUpdated();
      console.log("=== تمت عملية تحديث المستخدم بنجاح ===");
    } catch (error) {
      console.error("خطأ عام في تحديث المستخدم:", error);
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
      
      // حذف الأدوار أولاً
      const { error: roleError } = await supabase.rpc('delete_user_roles', {
        p_user_id: userToDelete.id
      });
      
      if (roleError) {
        console.error("خطأ في حذف أدوار المستخدم:", roleError);
        throw roleError;
      }
      
      // ثم حذف المستخدم
      const { error: userError } = await supabase.auth.admin.deleteUser(
        userToDelete.id
      );
      
      if (userError) {
        console.error("خطأ في حذف المستخدم:", userError);
        throw userError;
      }
      
      toast.success("تم حذف المستخدم بنجاح");
      setUserToDelete(null);
      onUserUpdated();
      console.log("=== تمت عملية حذف المستخدم بنجاح ===");
    } catch (error) {
      console.error("خطأ عام في حذف المستخدم:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
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
