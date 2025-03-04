
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

      // 1. استخدام واجهة Edge Function لجلب المستخدمين
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          operation: 'get_users'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("خطأ في جلب المستخدمين:", errorText);
        throw new Error(errorText);
      }

      const { users: authUsers } = await response.json();
      
      if (!authUsers || !Array.isArray(authUsers)) {
        console.error("خطأ: لم يتم استلام بيانات المستخدمين بشكل صحيح");
        throw new Error("بيانات المستخدمين غير صالحة");
      }
      
      console.log(`تم جلب ${authUsers.length} مستخدم من نظام المصادقة`);
      
      // 2. جلب الملفات الشخصية للمستخدمين
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, is_active')
        .in('id', authUsers.map(u => u.id));
      
      if (profilesError) {
        console.error("خطأ في جلب الملفات الشخصية:", profilesError);
        throw profilesError;
      }
      
      // 3. إنشاء خريطة لبيانات الملفات الشخصية للمستخدمين
      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, {
            displayName: profile.display_name,
            isActive: profile.is_active !== false // افتراضي true إذا لم يكن محددًا
          });
        });
      }
      
      // 4. جلب أدوار المستخدمين
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, roles:role_id(id, name)');
      
      if (rolesError) {
        console.error("خطأ في جلب أدوار المستخدمين:", rolesError);
        throw rolesError;
      }
      
      // 5. إنشاء خريطة لأدوار المستخدمين
      const rolesMap = new Map();
      if (userRoles) {
        userRoles.forEach(ur => {
          if (ur.roles) {
            // الوصول إلى حقل الاسم من كائن الدور وليس من المصفوفة
            rolesMap.set(ur.user_id, ur.roles.name);
          }
        });
      }
      
      // 6. جمع البيانات وتنسيقها
      const formattedUsers = authUsers.map(user => {
        const profileData = profilesMap.get(user.id) || {};
        
        // تحويل تاريخ آخر تسجيل دخول إلى تنسيق قابل للقراءة
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
          isActive: profileData.isActive !== false // افتراضي true إذا لم يكن محددًا
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
