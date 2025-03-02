
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export const useUserOperations = (onUserDeleted: () => void) => {
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
      // التعامل مع تغيير المسمى الشخصي
      console.log("تحديث بيانات المستخدم:", {
        id: selectedUser.id,
        displayName: selectedUser.displayName,
        role: selectedRole
      });

      // تحديث اسم العرض في جدول profiles
      if (selectedUser.displayName !== undefined) {
        const { error: displayNameError } = await supabase
          .from('profiles')
          .update({ display_name: selectedUser.displayName })
          .eq('id', selectedUser.id);

        if (displayNameError) {
          console.error("خطأ في تحديث المسمى الشخصي:", displayNameError);
          toast.error("حدث خطأ في تحديث المسمى الشخصي");
          return;
        }
      }

      // تحديث دور المستخدم إذا تم تحديد دور
      if (selectedRole) {
        // حذف الأدوار الحالية
        const { error: deleteRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id);

        if (deleteRoleError) {
          console.error("خطأ في حذف الأدوار الحالية:", deleteRoleError);
        }

        // إضافة الدور الجديد
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.id, role_id: selectedRole });

        if (insertRoleError) {
          console.error("خطأ في إضافة الدور الجديد:", insertRoleError);
          toast.error("حدث خطأ في تحديث دور المستخدم");
          return;
        }
      }

      // تغيير كلمة المرور إذا تم إدخالها
      if (newPassword.trim()) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { password: newPassword }
        );

        if (passwordError) {
          console.error("خطأ في تحديث كلمة المرور:", passwordError);
          toast.error("حدث خطأ في تحديث كلمة المرور");
          return;
        }
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      // إعادة تحميل البيانات بعد التحديث
      onUserDeleted();
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsSubmitting(true);

      // حذف المستخدم
      const { error } = await supabase.auth.admin.deleteUser(
        userToDelete.id
      );

      if (error) {
        console.error("خطأ في حذف المستخدم:", error);
        toast.error("حدث خطأ أثناء حذف المستخدم");
        return;
      }

      toast.success("تم حذف المستخدم بنجاح");
      onUserDeleted();
      setUserToDelete(null);
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setIsSubmitting(false);
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
