
import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { updateUserPassword, logUserActivity } from "./utils/userApiUtils";

export const useUserPasswordUpdate = () => {
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePassword = async (selectedUser: User | null) => {
    if (!selectedUser) {
      return false;
    }

    if (!newPassword) {
      console.log('لم يتم تقديم كلمة مرور جديدة، تخطي تحديث كلمة المرور');
      return true;
    }

    try {
      setIsSubmitting(true);
      await updateUserPassword(selectedUser.id, newPassword);
      
      // Log password change activity
      await logUserActivity(
        selectedUser.id, 
        'password_change', 
        'تم تغيير كلمة المرور'
      );
      
      return true;
    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    newPassword,
    setNewPassword,
    isSubmitting,
    updatePassword
  };
};
