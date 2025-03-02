
import { useState } from "react";
import { User } from "../types";
import { 
  assignUserRole, 
  deleteUserRoles, 
  verifyUserRoles, 
  logUserActivity 
} from "./utils/userApiUtils";

export const useUserRoleUpdate = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const updateRole = async (selectedUser: User | null) => {
    if (!selectedUser) {
      return false;
    }

    try {
      // Handle role change if provided
      if (selectedRole) {
        console.log('تعيين الدور الجديد:', selectedRole);
        await assignUserRole(selectedUser.id, selectedRole);
        
        // Verify the role update for debugging
        await verifyUserRoles(selectedUser.id);
        
        // Log role change activity
        await logUserActivity(
          selectedUser.id, 
          'role_change', 
          `تم تغيير الدور`
        );
      } else {
        // Remove all roles if none is selected
        await deleteUserRoles(selectedUser.id);
        
        // Log role removal activity
        await logUserActivity(
          selectedUser.id, 
          'role_change', 
          'تم إزالة الدور من المستخدم'
        );
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تحديث دور المستخدم:', error);
      return false;
    }
  };

  return {
    selectedRole,
    setSelectedRole,
    updateRole
  };
};
