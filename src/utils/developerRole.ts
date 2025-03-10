
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

// إضافة الدالة المفقودة للتحقق مما إذا كان المستخدم لديه دور المطور
export const isDeveloper = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // التحقق من وجود دور المطور
    const { data: developerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();
      
    if (!developerRole?.id) {
      return false;
    }
    
    // التحقق من تعيين المستخدم لدور المطور
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', developerRole.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking if user is developer:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isDeveloper:', error);
    return false;
  }
};

// إضافة الدالة المفقودة للتحقق مما إذا كان وضع المطور مفعل للمستخدم
export const isDeveloperModeEnabled = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // التحقق أولاً مما إذا كان المستخدم لديه دور المطور
    const hasDevRole = await isDeveloper(userId);
    
    if (!hasDevRole) {
      return false;
    }
    
    // الحصول على إعدادات المطور
    const { data: settings, error } = await supabase
      .from('developer_settings')
      .select('is_enabled')
      .single();
      
    if (error) {
      console.error('Error checking developer mode settings:', error);
      return false;
    }
    
    return settings?.is_enabled || false;
  } catch (error) {
    console.error('Error in isDeveloperModeEnabled:', error);
    return false;
  }
};

// إضافة الدالة المفقودة لتفعيل/تعطيل وضع المطور
export const toggleDeveloperMode = async (userId: string, enableMode: boolean): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // التحقق أولاً مما إذا كان المستخدم لديه دور المطور
    const hasDevRole = await isDeveloper(userId);
    
    if (!hasDevRole) {
      toast.error('ليس لديك صلاحية للوصول إلى وضع المطور');
      return false;
    }
    
    // تحديث إعدادات المطور
    const { data: settings } = await supabase
      .from('developer_settings')
      .select('id')
      .single();
      
    if (!settings?.id) {
      toast.error('لم يتم العثور على إعدادات المطور');
      return false;
    }
    
    const { error } = await supabase
      .from('developer_settings')
      .update({ is_enabled: enableMode })
      .eq('id', settings.id);
      
    if (error) {
      console.error('Error toggling developer mode:', error);
      toast.error('حدث خطأ أثناء تحديث وضع المطور');
      return false;
    }
    
    toast.success(enableMode ? 'تم تفعيل وضع المطور' : 'تم تعطيل وضع المطور');
    return true;
  } catch (error) {
    console.error('Error in toggleDeveloperMode:', error);
    toast.error('حدث خطأ أثناء تحديث وضع المطور');
    return false;
  }
};
