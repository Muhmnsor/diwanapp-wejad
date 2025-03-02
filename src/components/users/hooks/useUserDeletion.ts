
import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { deleteUser, logUserActivity } from "./utils/userApiUtils";

export const useUserDeletion = (onUserDeleted: () => void) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      console.log('=== بدء عملية حذف المستخدم ===');
      console.log('معرف المستخدم للحذف:', userToDelete.id);
      
      // Log user deletion activity before actual deletion
      await logUserActivity(
        userToDelete.id, 
        'user_deleted', 
        `تم حذف المستخدم ${userToDelete.username}`
      );

      // Delete the user
      await deleteUser(userToDelete.id);

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
    userToDelete,
    setUserToDelete,
    handleDeleteUser
  };
};
