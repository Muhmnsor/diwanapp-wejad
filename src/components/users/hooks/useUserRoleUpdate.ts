
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
      // إذا تم اختيار دور معين وليس القيمة الخاصة بإزالة الدور
      if (selectedRole && selectedRole !== 'remove_role') {
        console.log('تعيين الدور الجديد:', selectedRole);
        const result = await assignUserRole(selectedUser.id, selectedRole);
        
        if (!result) {
          console.error('فشل في تعيين الدور، عائد من الوظيفة هو false');
          return false;
        }
        
        // التحقق من تحديث الدور للتصحيح
        await verifyUserRoles(selectedUser.id);
        
        // تسجيل نشاط تغيير الدور
        await logUserActivity(
          selectedUser.id, 
          'role_change', 
          `تم تغيير الدور`
        );
      } else {
        // إذا تم اختيار "إزالة الدور" أو كانت القيمة فارغة، إزالة جميع الأدوار
        console.log('تم اختيار إزالة الدور، إزالة جميع الأدوار...');
        const result = await deleteUserRoles(selectedUser.id);
        
        if (!result) {
          console.error('فشل في حذف الأدوار، عائد من الوظيفة هو false');
          return false;
        }
        
        // تسجيل نشاط إزالة الدور
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
