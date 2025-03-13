
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Ensure default permissions are created
export const initializeDefaultPermissions = async (): Promise<boolean> => {
  try {
    // Check if default permissions exist
    const { data: existingPermissions, error: checkError } = await supabase
      .from('permissions')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking permissions:', checkError);
      return false;
    }
    
    // If permissions already exist, skip initialization
    if (existingPermissions && existingPermissions.length > 0) {
      return true;
    }
    
    // Create default permissions
    const defaultPermissions = [
      // User management permissions
      { module: 'المستخدمين', name: 'users_view', display_name: 'عرض المستخدمين', category: 'basic' },
      { module: 'المستخدمين', name: 'users_create', display_name: 'إضافة مستخدمين', category: 'basic' },
      { module: 'المستخدمين', name: 'users_edit', display_name: 'تعديل المستخدمين', category: 'basic' },
      { module: 'المستخدمين', name: 'users_delete', display_name: 'حذف المستخدمين', category: 'basic' },
      { module: 'المستخدمين', name: 'users_manage', display_name: 'إدارة المستخدمين', category: 'admin' },
      
      // Role management permissions
      { module: 'المستخدمين', name: 'roles_view', display_name: 'عرض الأدوار', category: 'roles' },
      { module: 'المستخدمين', name: 'roles_create', display_name: 'إضافة أدوار', category: 'roles' },
      { module: 'المستخدمين', name: 'roles_edit', display_name: 'تعديل الأدوار', category: 'roles' },
      { module: 'المستخدمين', name: 'roles_delete', display_name: 'حذف الأدوار', category: 'roles' },
      { module: 'المستخدمين', name: 'roles_manage', display_name: 'إدارة الأدوار', category: 'admin' },
      
      // Permission management
      { module: 'المستخدمين', name: 'permissions_view', display_name: 'عرض الصلاحيات', category: 'permissions' },
      { module: 'المستخدمين', name: 'permissions_edit', display_name: 'تعديل الصلاحيات', category: 'permissions' },
      { module: 'المستخدمين', name: 'permissions_assign', display_name: 'إسناد الصلاحيات', category: 'permissions' },
      { module: 'المستخدمين', name: 'app_permissions_edit', display_name: 'تعديل صلاحيات التطبيقات', category: 'permissions' },
      
      // Event permissions
      { module: 'الفعاليات', name: 'events_view', display_name: 'عرض الفعاليات', category: 'basic' },
      { module: 'الفعاليات', name: 'events_create', display_name: 'إنشاء فعاليات', category: 'basic' },
      { module: 'الفعاليات', name: 'events_edit', display_name: 'تعديل فعاليات', category: 'basic' },
      { module: 'الفعاليات', name: 'events_delete', display_name: 'حذف فعاليات', category: 'basic' },
      { module: 'الفعاليات', name: 'events_manage', display_name: 'إدارة الفعاليات', category: 'admin' },
      
      // Ideas permissions
      { module: 'الأفكار', name: 'ideas_view', display_name: 'عرض الأفكار', category: 'basic' },
      { module: 'الأفكار', name: 'ideas_create', display_name: 'إنشاء أفكار', category: 'basic' },
      { module: 'الأفكار', name: 'ideas_edit', display_name: 'تعديل أفكار', category: 'basic' },
      { module: 'الأفكار', name: 'ideas_delete', display_name: 'حذف أفكار', category: 'basic' },
      { module: 'الأفكار', name: 'ideas_manage', display_name: 'إدارة الأفكار', category: 'admin' },
      
      // Tasks permissions
      { module: 'المهام', name: 'tasks_view', display_name: 'عرض المهام', category: 'basic' },
      { module: 'المهام', name: 'tasks_create', display_name: 'إنشاء مهام', category: 'basic' },
      { module: 'المهام', name: 'tasks_edit', display_name: 'تعديل مهام', category: 'basic' },
      { module: 'المهام', name: 'tasks_delete', display_name: 'حذف مهام', category: 'basic' },
      { module: 'المهام', name: 'tasks_manage', display_name: 'إدارة المهام', category: 'admin' },
      
      // Documents permissions
      { module: 'المستندات', name: 'documents_view', display_name: 'عرض المستندات', category: 'basic' },
      { module: 'المستندات', name: 'documents_create', display_name: 'إنشاء مستندات', category: 'basic' },
      { module: 'المستندات', name: 'documents_edit', display_name: 'تعديل مستندات', category: 'basic' },
      { module: 'المستندات', name: 'documents_delete', display_name: 'حذف مستندات', category: 'basic' },
      { module: 'المستندات', name: 'documents_manage', display_name: 'إدارة المستندات', category: 'admin' }
    ];
    
    // Insert permissions in batches to avoid hitting request size limits
    const batchSize = 20;
    for (let i = 0; i < defaultPermissions.length; i += batchSize) {
      const batch = defaultPermissions.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('permissions')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting permissions batch ${i}-${i+batchSize}:`, insertError);
        return false;
      }
    }
    
    console.log('Default permissions created successfully');
    return true;
  } catch (error) {
    console.error('Error initializing default permissions:', error);
    return false;
  }
};

// Initialize developer role
export const initializeDeveloperRole = async (): Promise<void> => {
  try {
    // Ensure admin and developer roles exist
    const { data: existingRoles, error: checkError } = await supabase
      .from('roles')
      .select('id, name')
      .in('name', ['admin', 'developer']);

    if (checkError) {
      console.error('Error checking roles:', checkError);
      return;
    }

    const roles = existingRoles || [];
    const adminRoleExists = roles.some(r => r.name === 'admin');
    const developerRoleExists = roles.some(r => r.name === 'developer');

    // Create admin role if it doesn't exist
    if (!adminRoleExists) {
      const { error: adminRoleError } = await supabase
        .from('roles')
        .insert({
          name: 'admin',
          description: 'مدير النظام مع صلاحيات كاملة'
        });

      if (adminRoleError) {
        console.error('Error creating admin role:', adminRoleError);
      }
    }

    // Create developer role if it doesn't exist
    if (!developerRoleExists) {
      const { data: developerRole, error: developerRoleError } = await supabase
        .from('roles')
        .insert({
          name: 'developer',
          description: 'مطور مع صلاحيات كاملة للنظام'
        })
        .select('id')
        .single();

      if (developerRoleError) {
        console.error('Error creating developer role:', developerRoleError);
        return;
      }
    }

    // Initialize default permissions
    await initializeDefaultPermissions();
    
  } catch (error) {
    console.error('Error initializing developer role:', error);
    toast.error('حدث خطأ أثناء تهيئة النظام');
  }
};
