
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsersRolesData = () => {
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('جلب المستخدمين مع الأدوار...');
      
      // جلب جميع المستخدمين من profiles مع طباعة بيانات أكثر تفصيلاً
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name');

      if (profilesError) {
        console.error('خطأ في جلب بيانات المستخدمين:', profilesError);
        throw profilesError;
      }
      
      console.log('=== بيانات المستخدمين المستلمة من قاعدة البيانات ===');
      console.table(profilesData);
      console.log('عدد السجلات:', profilesData.length);
      
      // فحص قيم display_name
      const hasDisplayNames = profilesData.filter(profile => profile.display_name && profile.display_name.trim() !== '');
      console.log('عدد المستخدمين الذين لديهم مسميات وظيفية:', hasDisplayNames.length);
      if (hasDisplayNames.length > 0) {
        console.log('المستخدمين الذين لديهم مسميات وظيفية:');
        console.table(hasDisplayNames);
      } else {
        console.log('لا يوجد أي مستخدم لديه مسمى وظيفي محدد في قاعدة البيانات');
      }

      // ثم جلب أدوار المستخدمين مع معلومات الدور
      console.log('جلب أدوار المستخدمين...');
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
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
      
      console.log('=== بيانات أدوار المستخدمين ===');
      console.table(userRolesData);

      // تخطيط أدوار المستخدمين إلى معرفات المستخدمين
      const userRolesMap: Record<string, any> = {};
      userRolesData.forEach(ur => {
        userRolesMap[ur.user_id] = ur.roles;
      });
      
      // دمج البيانات - تضمين جميع المستخدمين، حتى أولئك الذين ليس لديهم أدوار
      const transformedUsers = profilesData.map((profile) => {
        const userRole = userRolesMap[profile.id];
        const user = {
          id: profile.id,
          username: profile.email || 'لم يتم تعيين بريد إلكتروني',
          displayName: profile.display_name || '',
          role: userRole?.name || 'لم يتم تعيين دور',
          lastLogin: 'غير متوفر' // نظرًا لأننا لا نستطيع الوصول إلى auth.users مباشرة
        };
        return user;
      });

      console.log('=== بيانات المستخدمين النهائية بعد المعالجة ===');
      console.table(transformedUsers);
      
      return transformedUsers as User[];
    },
    staleTime: 1000 * 30, // تخزين مؤقت لمدة 30 ثانية
  });

  return {
    users,
    isLoading: usersLoading,
    refetchUsers
  };
};
