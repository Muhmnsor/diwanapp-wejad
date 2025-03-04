
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";

interface UsePermissionCheckProps {
  assignedTo?: string | null;
}

export const usePermissionCheck = ({ assignedTo }: UsePermissionCheckProps) => {
  const { user } = useAuthStore();
  const [canEdit, setCanEdit] = useState<boolean>(false);
  
  useEffect(() => {
    const checkPermission = async () => {
      // إذا لم يكن هناك مستخدم مسجل الدخول، فلا توجد صلاحيات
      if (!user) {
        setCanEdit(false);
        return;
      }
      
      // المستخدم هو المكلف بالمهمة
      const isAssignee = assignedTo === user.id;
      
      // التحقق مما إذا كان المستخدم مدير نظام أو مدير تطبيق
      let isAdmin = user.isAdmin;
      
      // إذا لم تكن الحالة واضحة، تحقق من الأدوار مباشرة
      if (!isAdmin && user.id) {
        try {
          // تحقق من دور المستخدم من قاعدة البيانات
          const { data: userRole, error } = await supabase
            .from('user_roles')
            .select(`
              roles (
                name
              )
            `)
            .eq('user_id', user.id)
            .single();
          
          if (!error && userRole?.roles) {
            // تحقق مما إذا كان الدور هو 'admin' أو 'app_admin'
            const roleName = typeof userRole.roles === 'object' ? 
              (userRole.roles as { name: string }).name : '';
            
            isAdmin = ['admin', 'app_admin'].includes(roleName);
          }
        } catch (error) {
          console.error("خطأ في التحقق من صلاحيات المستخدم:", error);
        }
      }
      
      // السماح بالتعديل إذا كان المستخدم هو المكلف أو مدير النظام أو مدير التطبيق
      setCanEdit(isAssignee || isAdmin);
    };
    
    checkPermission();
  }, [user, assignedTo]);
  
  return { canEdit };
};
