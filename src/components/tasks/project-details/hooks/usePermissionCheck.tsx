
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/refactored-auth';

/**
 * Hook للتحقق من صلاحيات المستخدم للتعامل مع المهام الفرعية
 * يسمح فقط للمكلف بالمهمة أو مدير التطبيق أو مدير النظام بالتعديل
 */
export const usePermissionCheck = (assignedUserId?: string) => {
  const { user } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);

      try {
        // إذا لم يكن هناك مستخدم مسجل الدخول
        if (!user) {
          setHasPermission(false);
          return;
        }

        // إذا كان المستخدم هو المكلف بالمهمة
        if (assignedUserId && user.id === assignedUserId) {
          setHasPermission(true);
          return;
        }

        // التحقق إذا كان المستخدم مدير تطبيق أو مدير نظام
        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            roles (
              name
            )
          `)
          .eq('user_id', user.id);

        if (!userRolesData || userRolesData.length === 0) {
          setHasPermission(false);
          return;
        }

        // التحقق من أدوار المستخدم
        const isAdmin = userRolesData.some(roleData => {
          const role = roleData.roles as { name: string };
          return role.name === 'admin' || role.name === 'مدير النظام' || role.name === 'مدير التطبيق';
        });

        setHasPermission(isAdmin);
      } catch (error) {
        console.error("Error checking user permissions:", error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user, assignedUserId]);

  return { hasPermission, isLoading };
};
