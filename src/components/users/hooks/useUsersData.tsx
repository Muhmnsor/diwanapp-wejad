
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User, UserRoleData } from "../types";

export const useUsersData = () => {
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('جلب الأدوار من قاعدة البيانات...');
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error('خطأ في جلب الأدوار:', error);
        throw error;
      }
      
      console.log('تم جلب الأدوار بنجاح:', data);
      return data;
    }
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('جلب المستخدمين مع الأدوار...');
      
      // جلب جميع المستخدمين من profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');

      if (profilesError) {
        console.error('خطأ في جلب بيانات المستخدمين:', profilesError);
        throw profilesError;
      }
      
      console.log('تم جلب بيانات المستخدمين:', profilesData);

      // جلب أدوار المستخدمين بشكل مباشر من جدول user_roles
      console.log('جلب بيانات أدوار المستخدمين...');
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          roles (
            id,
            name,
            description
          )
        `);

      if (userRolesError) {
        console.error('خطأ في جلب أدوار المستخدمين:', userRolesError);
        throw userRolesError;
      }
      
      console.log('تم جلب أدوار المستخدمين:', userRolesData);

      // إنشاء خريطة لأدوار المستخدمين
      const userRolesMap: Record<string, any> = {};
      userRolesData.forEach(ur => {
        if (ur.roles) {
          userRolesMap[ur.user_id] = {
            roleId: ur.role_id,
            roleObj: ur.roles
          };
        }
      });
      
      console.log('خريطة أدوار المستخدمين:', userRolesMap);

      // دمج البيانات - تضمين جميع المستخدمين، حتى أولئك الذين ليس لديهم أدوار
      const transformedUsers = profilesData.map((profile) => {
        const userRole = userRolesMap[profile.id];
        const user = {
          id: profile.id,
          username: profile.email || 'لم يتم تعيين بريد إلكتروني',
          role: userRole?.roleObj?.name || 'لم يتم تعيين دور',
          roleId: userRole?.roleId || '',
          lastLogin: 'غير متوفر' // نظرًا لأننا لا نستطيع الوصول إلى auth.users مباشرة
        };
        console.log('تم إنشاء كائن المستخدم:', user);
        return user;
      });

      console.log('جميع المستخدمين (بما في ذلك الذين ليس لديهم أدوار):', transformedUsers);
      return transformedUsers as User[];
    },
    staleTime: 1000 * 15, // تخزين مؤقت لمدة 15 ثانية
  });

  return {
    roles,
    users,
    isLoading: rolesLoading || usersLoading,
    refetchUsers
  };
};
