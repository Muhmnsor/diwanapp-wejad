
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
      // Handle password change if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.functions.invoke('manage-users', {
          body: {
            operation: 'update_password',
            userId: selectedUser.id,
            newPassword
          }
        });

        if (passwordError) throw passwordError;
      }

      // Handle role change if selected role is different from current role
      if (selectedRole && selectedRole !== selectedUser.role) {
        console.log('Updating user role:', { userId: selectedUser.id, newRole: selectedRole });
        
        // Check if the user already has a role assigned
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', selectedUser.id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is fine
          console.error('Error checking existing role:', checkError);
          throw checkError;
        }
        
        // If user already has a role, update it instead of inserting a new one
        if (existingRole) {
          console.log('User has existing role, updating it:', existingRole);
          const { error: updateRoleError } = await supabase
            .from('user_roles')
            .update({ role_id: selectedRole })
            .eq('user_id', selectedUser.id);
            
          if (updateRoleError) {
            console.error('Error updating role:', updateRoleError);
            throw updateRoleError;
          }
        } else {
          // If no existing role, insert a new one
          console.log('No existing role, inserting new one');
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: selectedUser.id,
              role_id: selectedRole
            });
            
          if (insertRoleError) {
            console.error('Error assigning new role:', insertRoleError);
            throw insertRoleError;
          }
        }
        
        // Log user activity for role change
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'role_change',
          details: `تم تغيير الدور إلى ${selectedRole}`
        });
      }

      if (newPassword) {
        // Log password change activity
        await supabase.rpc('log_user_activity', {
          user_id: selectedUser.id,
          activity_type: 'password_change',
          details: 'تم تغيير كلمة المرور'
        });
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setSelectedUser(null);
      setNewPassword("");
      setSelectedRole("");
      onUserDeleted(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Log user deletion activity before deleting the user
      await supabase.rpc('log_user_activity', {
        user_id: userToDelete.id,
        activity_type: 'user_deleted',
        details: `تم حذف المستخدم ${userToDelete.username}`
      });

      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          operation: 'delete_user',
          userId: userToDelete.id
        }
      });

      if (error) throw error;

      toast.success("تم حذف المستخدم بنجاح");
      onUserDeleted();
    } catch (error) {
      console.error('Error deleting user:', error);
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
