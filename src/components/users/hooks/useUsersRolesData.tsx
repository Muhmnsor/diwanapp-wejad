
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsersRolesData = () => {
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('جلب المستخدمين مع الأدوار...');
      
      try {
        // 1. جلب جميع المستخدمين من profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, display_name');

        if (profilesError) {
          console.error('خطأ في جلب بيانات المستخدمين:', profilesError);
          throw profilesError;
        }
        
        console.log('تم جلب بيانات المستخدمين:', profilesData?.length || 0, 'مستخدم', profilesData);

        if (!profilesData || profilesData.length === 0) {
          console.log('لا يوجد مستخدمين في جدول profiles');
          return [];
        }

        // 2. جلب بيانات الأدوار
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id, name, description');

        if (rolesError) {
          console.error('خطأ في جلب بيانات الأدوار:', rolesError);
          // المتابعة بالرغم من وجود خطأ في جلب الأدوار
          console.log('المتابعة بدون بيانات الأدوار');
        } else {
          console.log('تم جلب بيانات الأدوار:', rolesData?.length || 0, 'دور', rolesData);
        }

        // 3. جلب أدوار المستخدمين
        const { data: userRolesData, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role_id
          `);

        if (userRolesError) {
          console.error('خطأ في جلب أدوار المستخدمين:', userRolesError);
          // المتابعة بالرغم من وجود خطأ في جلب أدوار المستخدمين
          console.log('المتابعة بدون بيانات أدوار المستخدمين');
        } else {
          console.log('تم جلب بيانات أدوار المستخدمين:', userRolesData?.length || 0, 'علاقة', userRolesData);
        }

        // تخطيط أدوار المستخدمين إلى معرفات المستخدمين إذا كانت متوفرة
        const userRolesMap: Record<string, string> = {};
        
        if (userRolesData && rolesData) {
          userRolesData.forEach(ur => {
            // البحث عن اسم الدور المقابل لمعرف الدور
            const role = rolesData.find(r => r.id === ur.role_id);
            if (role) {
              userRolesMap[ur.user_id] = role.name;
            }
          });
        }
        
        console.log('خريطة أدوار المستخدمين:', userRolesMap);

        // دمج البيانات - تضمين جميع المستخدمين، حتى أولئك الذين ليس لديهم أدوار
        const transformedUsers = profilesData.map((profile) => {
          const userRole = userRolesMap[profile.id];
          const user = {
            id: profile.id,
            username: profile.email || 'لم يتم تعيين بريد إلكتروني',
            displayName: profile.display_name || '',
            role: userRole || 'لم يتم تعيين دور',
            lastLogin: 'غير متوفر' // نظرًا لأننا لا نستطيع الوصول إلى auth.users مباشرة
          };
          console.log('تم إنشاء كائن المستخدم:', user);
          return user;
        });

        console.log('جميع المستخدمين:', transformedUsers.length);
        return transformedUsers as User[];
      } catch (error) {
        console.error('خطأ غير متوقع في جلب البيانات:', error);
        return [];
      }
    },
    staleTime: 1000 * 30, // تخزين مؤقت لمدة 30 ثانية
  });

  return {
    users,
    isLoading: usersLoading,
    refetchUsers
  };
};
