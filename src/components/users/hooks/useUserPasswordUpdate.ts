
import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { updateUserPassword, logUserActivity } from "./utils";

export const useUserPasswordUpdate = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updatePassword = async (selectedUser: User | null) => {
    if (!selectedUser) {
      return false;
    }

    // إذا لم يتم إدخال كلمة مرور جديدة، نتخطى عملية تحديث كلمة المرور
    if (!newPassword) {
      console.log('لم يتم تقديم كلمة مرور جديدة، تخطي عملية تحديث كلمة المرور');
      return true;
    }

    try {
      console.log('تحديث كلمة المرور للمستخدم:', selectedUser.id);
      await updateUserPassword(selectedUser.id, newPassword);
      
      // تسجيل نشاط تغيير كلمة المرور
      await logUserActivity(
        selectedUser.id, 
        'password_change', 
        'تم تغيير كلمة المرور'
      );
      
      return true;
    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      toast.error("فشل في تحديث كلمة المرور");
      return false;
    }
  };

  return {
    newPassword,
    setNewPassword,
    isSubmitting,
    setIsSubmitting,
    updatePassword
  };
};
