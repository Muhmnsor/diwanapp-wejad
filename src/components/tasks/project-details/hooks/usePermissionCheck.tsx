
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";

interface UsePermissionCheckProps {
  assignedTo?: string | null;
  projectId?: string | null;
  workspaceId?: string | null;
}

export const usePermissionCheck = ({ assignedTo, projectId, workspaceId }: UsePermissionCheckProps) => {
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
      let isProjectManager = false;
      let isWorkspaceManager = false;
      
      // التحقق من إذا كان المستخدم هو مدير المشروع
      if (projectId && user.id) {
        try {
          const { data: projectData, error: projectError } = await supabase
            .from('project_tasks')
            .select('project_manager')
            .eq('id', projectId)
            .single();
          
          if (!projectError && projectData) {
            isProjectManager = projectData.project_manager === user.id;
          }
        } catch (error) {
          console.error("خطأ في التحقق من مدير المشروع:", error);
        }
      }
      
      // التحقق من إذا كان المستخدم هو مدير مساحة العمل
      if (workspaceId && user.id) {
        try {
          const { data: workspaceMember, error: workspaceError } = await supabase
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', user.id)
            .single();
          
          if (!workspaceError && workspaceMember) {
            isWorkspaceManager = workspaceMember.role === 'admin';
          }
        } catch (error) {
          console.error("خطأ في التحقق من مدير مساحة العمل:", error);
        }
      }
      
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
            // تصحيح المشكلة هنا: التحقق من نوع البيانات قبل استخدامها
            const roleName = typeof userRole.roles === 'object' ? 
              // إذا كان userRole.roles كائن، نتحقق مما إذا كان مصفوفة أولاً
              Array.isArray(userRole.roles) ? 
                // إذا كانت مصفوفة، نأخذ الاسم من العنصر الأول إذا وجد
                (userRole.roles[0] && userRole.roles[0].name) : 
                // وإلا نعامله ككائن مفرد
                (userRole.roles as { name: string }).name 
              : '';
            
            isAdmin = ['admin', 'app_admin'].includes(roleName);
          }
        } catch (error) {
          console.error("خطأ في التحقق من صلاحيات المستخدم:", error);
        }
      }
      
      // السماح بالتعديل إذا كان المستخدم هو المكلف أو مدير النظام أو مدير التطبيق
      // أو مدير المشروع أو مدير مساحة العمل
      setCanEdit(isAssignee || isAdmin || isProjectManager || isWorkspaceManager);
    };
    
    checkPermission();
  }, [user, assignedTo, projectId, workspaceId]);
  
  return { canEdit };
};
