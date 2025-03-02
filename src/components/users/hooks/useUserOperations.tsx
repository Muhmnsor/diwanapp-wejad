
import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { useUserPasswordUpdate } from "./useUserPasswordUpdate";
import { useUserRoleUpdate } from "./useUserRoleUpdate";
import { useUserDeletion } from "./useUserDeletion";

export const useUserOperations = (onUserDeleted: () => void) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  
  // Import sub-hooks
  const { 
    newPassword, 
    setNewPassword, 
    isSubmitting, 
    updatePassword 
  } = useUserPasswordUpdate();
  
  const { 
    selectedRole, 
    setSelectedRole, 
    updateRole 
  } = useUserRoleUpdate();
  
  const { 
    userToDelete, 
    setUserToDelete, 
    handleDeleteUser 
  } = useUserDeletion(onUserDeleted);
  
  // Combined handler for password and role changes
  const handlePasswordChange = async () => {
    if (!selectedUser) {
      toast.error("الرجاء تحديد المستخدم");
      return;
    }

    try {
      console.log('=== بدء عملية تحديث المستخدم ===');
      console.log('معرف المستخدم:', selectedUser.id);
      console.log('الدور المحدد:', selectedRole || 'لم يتم تحديد دور جديد');
      console.log('تم تقديم كلمة مرور جديدة:', newPassword ? 'نعم' : 'لا');

      // Update password if provided
      const passwordSuccess = await updatePassword(selectedUser);
      
      // Update role if needed
      const roleSuccess = await updateRole(selectedUser);
      
      // If both operations were successful or not needed
      if (passwordSuccess && roleSuccess) {
        toast.success("تم تحديث بيانات المستخدم بنجاح");
        setSelectedUser(null);
        setNewPassword("");
        setSelectedRole(null);
        onUserDeleted(); // تحديث قائمة المستخدمين
      }
    } catch (error) {
      console.error('خطأ عام في تحديث المستخدم:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    }
  };

  return {
    // User state
    selectedUser,
    setSelectedUser,
    userToDelete,
    setUserToDelete,
    userToView,
    setUserToView,
    
    // Password state
    newPassword,
    setNewPassword,
    
    // Role state
    selectedRole,
    setSelectedRole,
    
    // Loading state
    isSubmitting,
    
    // Handlers
    handlePasswordChange,
    handleDeleteUser
  };
};
