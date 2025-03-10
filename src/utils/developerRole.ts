
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { assignDeveloperRole } from "./developerRoleIntegration";

export const initializeDeveloperRole = async (): Promise<void> => {
  try {
    // التحقق من وجود دور المطور
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (!existingRole) {
      // إنشاء دور المطور إذا لم يكن موجوداً
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'دور المطور مع صلاحيات للوصول إلى أدوات التطوير وإعدادات النظام'
        })
        .select('id')
        .single();

      if (roleError) {
        console.error('Error creating developer role:', roleError);
        return;
      }

      console.log('Developer role created successfully:', newRole);
      
      // التحقق من وجود جدول الأذونات
      await supabase.rpc('create_permissions_if_not_exist');
      
      // إضافة أذونات المطور
      const developerPermissions = [
        {
          name: 'view_developer_tools',
          description: 'الوصول إلى أدوات المطور',
          module: 'developer'
        },
        {
          name: 'modify_system_settings',
          description: 'تعديل إعدادات النظام',
          module: 'developer'
        },
        {
          name: 'access_api_logs',
          description: 'الوصول إلى سجلات API',
          module: 'developer'
        }
      ];
      
      const { error: permissionsError } = await supabase
        .from('permissions')
        .upsert(developerPermissions, { onConflict: 'name' });
        
      if (permissionsError) {
        console.error('Error creating developer permissions:', permissionsError);
      }
    }
    
    // التحقق من وجود إعدادات المطور
    await initializeDeveloperSettings();
    
  } catch (error) {
    console.error('Error in initializeDeveloperRole:', error);
  }
};

const initializeDeveloperSettings = async (): Promise<void> => {
  try {
    // التحقق من وجود إعدادات المطور
    const { data: existingSettings } = await supabase
      .from('developer_settings')
      .select('id')
      .single();
      
    if (!existingSettings) {
      // إنشاء إعدادات المطور الافتراضية
      const { error } = await supabase
        .from('developer_settings')
        .insert({
          is_enabled: false,
          show_toolbar: true,
          realtime_enabled: true,
          cache_time_minutes: 5,
          update_interval_seconds: 30,
          debug_level: 'info'
        });
        
      if (error) {
        console.error('Error creating developer settings:', error);
      } else {
        console.log('Developer settings created successfully');
      }
    }
  } catch (error) {
    console.error('Error in initializeDeveloperSettings:', error);
  }
};

// دالة تلقائية لتعيين دور المطور للمستخدم الحالي
export const autoAssignDeveloperRole = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    // التحقق مما إذا كان المستخدم مسؤولاً
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (userData?.is_admin) {
      // تعيين دور المطور تلقائياً للمسؤول
      await assignDeveloperRole(userId);
    }
  } catch (error) {
    console.error('Error in autoAssignDeveloperRole:', error);
  }
};
