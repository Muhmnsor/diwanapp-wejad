
import { useState } from "react";
import { toast } from "sonner";
import { createUser, UserCreationData } from "../services/userCreationService";

interface UseCreateUserFormProps {
  onSuccess: () => void;
  onUserCreated?: () => void;
  onClose: () => void;
}

export const useCreateUserForm = ({ onSuccess, onUserCreated, onClose }: UseCreateUserFormProps) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewUsername("");
    setNewPassword("");
    setNewDisplayName("");
    setSelectedRole("");
  };

  const onDialogClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword || !selectedRole) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      const userData: UserCreationData = {
        username: newUsername,
        password: newPassword,
        displayName: newDisplayName,
        roleId: selectedRole,
      };
      
      await createUser(userData);
      
      toast.success("تم إنشاء المستخدم بنجاح");
      onDialogClose();
      // Call both success callbacks for compatibility
      onSuccess();
      if (onUserCreated) onUserCreated();
    } catch (error) {
      console.error("خطأ عام في إنشاء المستخدم:", error);
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      newUsername,
      setNewUsername,
      newPassword,
      setNewPassword,
      newDisplayName,
      setNewDisplayName,
      selectedRole,
      setSelectedRole,
      isSubmitting,
    },
    handlers: {
      handleCreateUser,
      onDialogClose,
    },
  };
};
