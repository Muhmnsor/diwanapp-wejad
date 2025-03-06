
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

interface UseTaskPermissionsProps {
  projectId?: string;
  taskCreatorId?: string | null;
}

export const useTaskPermissions = ({ projectId, taskCreatorId }: UseTaskPermissionsProps) => {
  const { user } = useAuthStore();
  const [canModify, setCanModify] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);
      
      // إذا لم يكن هناك مستخدم مسجل الدخول، فلا توجد صلاحيات
      if (!user) {
        setCanModify(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // التحقق مما إذا كان المستخدم هو منشئ المهمة
        const isCreator = taskCreatorId === user.id;
        
        // التحقق مما إذا كان المستخدم مدير المشروع
        let isProjectManager = false;
        if (projectId) {
          const { data: projectData } = await supabase
            .from('project_tasks')
            .select('manager_id')
            .eq('id', projectId)
            .single();
          
          isProjectManager = projectData?.manager_id === user.id;
        }
        
        // التحقق مما إذا كان المستخدم مدير نظام
        let isAdmin = user.isAdmin;
        
        if (!isAdmin && user.id) {
          // تحقق من دور المستخدم من قاعدة البيانات
          const { data: userRole } = await supabase
            .from('user_roles')
            .select(`
              roles (
                name
              )
            `)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (userRole?.roles) {
            const roleName = typeof userRole.roles === 'object' ? 
              Array.isArray(userRole.roles) ? 
                (userRole.roles[0] && userRole.roles[0].name) : 
                (userRole.roles as { name: string }).name 
              : '';
            
            isAdmin = ['admin', 'app_admin'].includes(roleName);
          }
        }
        
        // السماح بالتعديل إذا كان المستخدم هو المنشئ أو مدير المشروع أو مدير النظام
        setCanModify(isCreator || isProjectManager || isAdmin);
      } catch (error) {
        console.error("خطأ في التحقق من صلاحيات المستخدم:", error);
        setCanModify(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPermission();
  }, [user, taskCreatorId, projectId]);
  
  return { canModify, isLoading };
};
