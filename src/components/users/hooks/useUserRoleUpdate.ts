import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { 
  assignUserRole, 
  deleteUserRoles, 
  verifyUserRoles, 
  logUserActivity 
} from "./utils";

export const useUserRoleUpdate = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const updateRole = async (selectedUser: User | null) => {
    if (!selectedUser) {
      console.error('فشل في تحديث الدور: لم يتم تحديد مستخدم');
      toast.error("لم يتم تحديد أي مستخدم");
      return false;
    }

    try {
      console.log('بدء عملية تحديث الدور للمستخدم:', selectedUser.username);
      console.log('الدور المحدد:', selectedRole);
      
      // إذا تم اختيار دور معين وليس "remove_role"
      if (selectedRole && selectedRole !== 'remove_role') {
        console.log('تعيين الدور الجديد:', selectedRole);
        
        // تسجيل المعلومات قبل استدعاء assignUserRole للتصحيح
        console.log('استدعاء assignUserRole مع المعلمات:', {
          userId: selectedUser.id,
          roleId: selectedRole
        });
        
        const result = await assignUserRole(selectedUser.id, selectedRole);
        console.log('نتيجة assignUserRole:', result);
        
        if (!result) {
          console.error('فشل في تعيين الدور، عائد من الوظيفة هو false');
          toast.error("فشل في تعيين الدور للمستخدم");
          return false;
        }
        
        // تسجيل نشاط تغيير الدور
        await logUserActivity(
          selectedUser.id, 
          'role_change', 
          `تم تغيير الدور إلى: ${selectedRole}`
        );
        
        toast.success("تم تحديث دور المستخدم بنجاح");
        return true;
      } else {
        // إذا تم اختيار "إزالة الدور" أو كانت القيمة فارغة، إزالة جميع الأدوار
        console.log('تم اختيار إزالة الدور، إزالة جميع الأدوار...');
        const result = await deleteUserRoles(selectedUser.id);
        console.log('نتيجة deleteUserRoles:', result);
        
        if (!result) {
          console.error('فشل في حذف الأدوار، عائد من الوظيفة هو false');
          toast.error("فشل في إزالة أدوار المستخدم");
          return false;
        }
        
        // تسجيل نشاط إزالة الدور
        await logUserActivity(
          selectedUser.id, 
          'role_change', 
          'تم إزالة الدور من المستخدم'
        );
        
        toast.success("تم إزالة دور المستخدم بنجاح");
        return true;
      }
    } catch (error) {
      console.error('خطأ في تحديث دور المستخدم:', error);
      toast.error("حدث خطأ أثناء تحديث دور المستخدم");
      return false;
    }
  };

  return {
    selectedRole,
    setSelectedRole,
    updateRole
  };
};
