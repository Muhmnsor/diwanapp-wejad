
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Role, User } from "../types";

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log("بدء جلب بيانات المستخدمين");

      const response = await supabase.functions.invoke('manage-users', {
        body: JSON.stringify({
          operation: 'get_users'
        })
      });

      if (response.error) {
        console.error("خطأ في جلب المستخدمين:", response.error);
        throw response.error;
      }

      const { users: authUsers } = response.data;
      
      if (!authUsers || !Array.isArray(authUsers)) {
        console.error("خطأ: لم يتم استلام بيانات المستخدمين بشكل صحيح");
        throw new Error("بيانات المستخدمين غير صالحة");
      }
      
      console.log(`تم جلب ${authUsers.length} مستخدم من نظام المصادقة`);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, is_active')
        .in('id', authUsers.map(u => u.id));
      
      if (profilesError) {
        console.error("خطأ في جلب الملفات الشخصية:", profilesError);
        throw profilesError;
      }
      
      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, {
            displayName: profile.display_name,
            isActive: profile.is_active !== false
          });
        });
      }
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, roles:role_id(id, name)');
      
      if (rolesError) {
        console.error("خطأ في جلب أدوار المستخدمين:", rolesError);
        throw rolesError;
      }
      
      const rolesMap = new Map();
      if (userRoles) {
        userRoles.forEach(ur => {
          // تعديل للتعامل مع حالة كون roles مصفوفة أو كائن فردي
          if (ur.roles) {
            // تحقق مما إذا كان roles مصفوفة
            if (Array.isArray(ur.roles)) {
              // إذا كان مصفوفة، استخدم الكائن الأول إذا كان موجودًا
              if (ur.roles.length > 0) {
                // تحديد النوع بشكل صريح للتأكد من أن TypeScript يفهم البنية
                const role = ur.roles[0] as { id: string, name: string };
                rolesMap.set(ur.user_id, role.name);
              }
            } else {
              // إذا كان كائنًا فرديًا
              const role = ur.roles as { id: string, name: string };
              rolesMap.set(ur.user_id, role.name);
            }
          }
        });
      }
      
      const formattedUsers = authUsers.map(user => {
        const profileData = profilesMap.get(user.id) || {};
        
        let lastLoginDisplay = 'لم يسجل الدخول بعد';
        if (user.last_sign_in_at) {
          const date = new Date(user.last_sign_in_at);
          lastLoginDisplay = date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        return {
          id: user.id,
          username: user.email || 'لا يوجد بريد إلكتروني',
          role: rolesMap.get(user.id) || 'لم يتم تعيين دور',
          lastLogin: lastLoginDisplay,
          displayName: profileData.displayName || '',
          isActive: profileData.isActive !== false
        };
      });
      
      console.log("تم إعداد بيانات المستخدمين:", formattedUsers.length);
      setUsers(formattedUsers);
      
    } catch (error) {
      console.error("خطأ عام في جلب بيانات المستخدمين:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) throw error;
      
      console.log("تم جلب الأدوار:", data);
      setRoles(data || []);
    } catch (error) {
      console.error("خطأ في جلب الأدوار:", error);
    }
  };

  const refetchUsers = async () => {
    setIsLoading(true);
    await Promise.all([fetchUsers(), fetchRoles()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refetchUsers();
  }, []);

  return {
    users,
    roles,
    isLoading,
    refetchUsers
  };
};
