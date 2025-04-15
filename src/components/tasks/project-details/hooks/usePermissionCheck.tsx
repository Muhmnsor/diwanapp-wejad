import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspacePermissions } from "@/hooks/tasks/useWorkspacePermissions";

interface UsePermissionCheckProps {
  assignedTo?: string | null;
  projectId?: string | null;
  workspaceId?: string | null;
  createdBy?: string | null;
  isGeneral?: boolean;
  projectManager?: string | null;
}

export const usePermissionCheck = ({ 
  assignedTo, 
  projectId, 
  workspaceId, 
  createdBy,
  isGeneral,
  projectManager
}: UsePermissionCheckProps) => {
  const { user } = useAuthStore();
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const { canDelete } = useWorkspacePermissions(workspaceId || '', projectId || '');
  
  useEffect(() => {
    const checkPermission = async () => {
      // إذا لم يكن هناك مستخدم مسجل الدخول، فلا توجد صلاحيات
      if (!user) {
        setCanEdit(false);
        return;
      }
      
      // التحقق مما إذا كان المستخدم مدير نظام
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
            .maybeSingle();
          
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
      
      // إذا كان المستخدم مدير نظام، فلديه الصلاحية
      if (isAdmin) {
        setCanEdit(true);
        return;
      }
      
      // المستخدم هو المكلف بالمهمة
      const isAssignee = assignedTo === user.id;
      
      // المستخدم هو منشئ المهمة
      const isCreator = createdBy === user.id;
      
      // التحقق من الصلاحيات المختلفة حسب نوع المهمة
      if (isGeneral) {
        // للمهام العامة: فقط مدير النظام أو منشئ المهمة
        setCanEdit(isAdmin || isCreator);
      } else {
        // للمهام التابعة لمشروع: نتحقق من دور المستخدم في المشروع أو مساحة العمل
        
        // إذا كان المستخدم هو المكلف، فله الصلاحية (للمهام في المشاريع فقط)
        if (isAssignee) {
          setCanEdit(true);
          return;
        }
        
        // التحقق من دور المستخدم في المشروع
        if (projectId) {
          try {
            const { data: projectRole, error: projectError } = await supabase
              .from('project_members')
              .select('role')
              .eq('project_id', projectId)
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (!projectError && projectRole) {
              // إذا كان المستخدم مدير المشروع، فلديه الصلاحية
              const isProjectManager = projectRole.role === 'manager';
              
              if (isProjectManager) {
                setCanEdit(true);
                return;
              }
            }
          } catch (error) {
            console.error("خطأ في التحقق من دور المستخدم في المشروع:", error);
          }
        }
        
        // التحقق من دور المستخدم في مساحة العمل
        if (workspaceId) {
          try {
            const { data: workspaceRole, error: workspaceError } = await supabase
              .from('workspace_members')
              .select('role')
              .eq('workspace_id', workspaceId)
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (!workspaceError && workspaceRole) {
              // إذا كان المستخدم مدير مساحة العمل، فلديه الصلاحية
              const isWorkspaceManager = workspaceRole.role === 'admin';
              
              if (isWorkspaceManager) {
                setCanEdit(true);
                return;
              }
            }
          } catch (error) {
            console.error("خطأ في التحقق من دور المستخدم في مساحة العمل:", error);
          }
        }
        
        // افتراضياً، ليس لدى المستخدم صلاحية
        setCanEdit(false);
      }
    };
    
    checkPermission();
  }, [user, assignedTo, projectId, workspaceId, createdBy, isGeneral, projectManager]);
  
  // تحقق من صلاحيات المستخدم بناءً على الدور المحدد
  const userHasPermission = user && (
    user.role === 'admin' ||
    user.role === 'مدير ادارة' ||
    user.role === 'developer' ||
    user.id === projectManager
  );
  
  return { canEdit: canEdit || userHasPermission, canDelete };
};
