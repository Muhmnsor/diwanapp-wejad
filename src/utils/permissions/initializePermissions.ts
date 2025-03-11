
import { supabase } from "@/integrations/supabase/client";
import { formatPermissionName } from "@/components/users/permissions/utils/moduleMapping";

interface PermissionDefinition {
  name: string;
  description: string;
  module: string;
}

/**
 * Initialize the default permissions in the database
 */
export async function initializeDefaultPermissions(): Promise<void> {
  try {
    console.log("Initializing default permissions...");
    
    // Define the permissions for each module
    const permissions: PermissionDefinition[] = [
      // Admin permissions
      { name: formatPermissionName('admin', 'access'), description: 'الوصول إلى قائمة الإدارة', module: 'admin' },
      { name: formatPermissionName('admin', 'manage_system'), description: 'إدارة إعدادات النظام', module: 'admin' },
      { name: formatPermissionName('admin', 'view_logs'), description: 'عرض سجلات النظام', module: 'admin' },
      
      // Users permissions
      { name: formatPermissionName('users', 'view'), description: 'عرض المستخدمين', module: 'users' },
      { name: formatPermissionName('users', 'create'), description: 'إنشاء مستخدمين جدد', module: 'users' },
      { name: formatPermissionName('users', 'edit'), description: 'تعديل بيانات المستخدمين', module: 'users' },
      { name: formatPermissionName('users', 'delete'), description: 'حذف المستخدمين', module: 'users' },
      { name: formatPermissionName('users', 'manage_roles'), description: 'إدارة أدوار المستخدمين', module: 'users' },
      
      // Events permissions
      { name: formatPermissionName('events', 'view'), description: 'عرض الفعاليات', module: 'events' },
      { name: formatPermissionName('events', 'create'), description: 'إنشاء فعاليات جديدة', module: 'events' },
      { name: formatPermissionName('events', 'edit'), description: 'تعديل الفعاليات', module: 'events' },
      { name: formatPermissionName('events', 'delete'), description: 'حذف الفعاليات', module: 'events' },
      { name: formatPermissionName('events', 'approve'), description: 'اعتماد الفعاليات', module: 'events' },
      
      // Tasks permissions
      { name: formatPermissionName('tasks', 'view'), description: 'عرض المهام', module: 'tasks' },
      { name: formatPermissionName('tasks', 'create'), description: 'إنشاء مهام جديدة', module: 'tasks' },
      { name: formatPermissionName('tasks', 'edit'), description: 'تعديل المهام', module: 'tasks' },
      { name: formatPermissionName('tasks', 'delete'), description: 'حذف المهام', module: 'tasks' },
      { name: formatPermissionName('tasks', 'assign'), description: 'إسناد المهام', module: 'tasks' },
      
      // Documents permissions
      { name: formatPermissionName('documents', 'view'), description: 'عرض المستندات', module: 'documents' },
      { name: formatPermissionName('documents', 'create'), description: 'إنشاء مستندات جديدة', module: 'documents' },
      { name: formatPermissionName('documents', 'edit'), description: 'تعديل المستندات', module: 'documents' },
      { name: formatPermissionName('documents', 'delete'), description: 'حذف المستندات', module: 'documents' },
      
      // Ideas permissions
      { name: formatPermissionName('ideas', 'view'), description: 'عرض الأفكار', module: 'ideas' },
      { name: formatPermissionName('ideas', 'create'), description: 'إنشاء أفكار جديدة', module: 'ideas' },
      { name: formatPermissionName('ideas', 'edit'), description: 'تعديل الأفكار', module: 'ideas' },
      { name: formatPermissionName('ideas', 'delete'), description: 'حذف الأفكار', module: 'ideas' },
      { name: formatPermissionName('ideas', 'approve'), description: 'اعتماد الأفكار', module: 'ideas' },
      
      // Finance permissions
      { name: formatPermissionName('finance', 'view'), description: 'عرض البيانات المالية', module: 'finance' },
      { name: formatPermissionName('finance', 'create'), description: 'إنشاء معاملات مالية', module: 'finance' },
      { name: formatPermissionName('finance', 'edit'), description: 'تعديل المعاملات المالية', module: 'finance' },
      { name: formatPermissionName('finance', 'delete'), description: 'حذف المعاملات المالية', module: 'finance' },
      { name: formatPermissionName('finance', 'approve'), description: 'اعتماد المعاملات المالية', module: 'finance' },
      
      // Reports permissions
      { name: formatPermissionName('reports', 'view'), description: 'عرض التقارير', module: 'reports' },
      { name: formatPermissionName('reports', 'create'), description: 'إنشاء تقارير جديدة', module: 'reports' },
      { name: formatPermissionName('reports', 'export'), description: 'تصدير التقارير', module: 'reports' },
      
      // Settings permissions
      { name: formatPermissionName('settings', 'view'), description: 'عرض الإعدادات', module: 'settings' },
      { name: formatPermissionName('settings', 'edit'), description: 'تعديل الإعدادات', module: 'settings' },
      
      // Developer permissions
      { name: formatPermissionName('developer', 'access'), description: 'الوصول إلى أدوات المطور', module: 'developer' },
      { name: formatPermissionName('developer', 'manage'), description: 'إدارة إعدادات المطور', module: 'developer' }
    ];
    
    // Insert permissions with upsert to avoid duplicates
    for (let i = 0; i < permissions.length; i += 25) { // Process in batches of 25
      const batch = permissions.slice(i, i + 25);
      const { error } = await supabase
        .from('permissions')
        .upsert(
          batch, 
          { 
            onConflict: 'name',
            ignoreDuplicates: false
          }
        );
      
      if (error) {
        console.error("Error inserting permissions batch:", error);
      }
    }
    
    console.log("Permission initialization completed");
  } catch (error) {
    console.error("Error initializing permissions:", error);
  }
}

/**
 * Initialize the admin role with all permissions
 */
export async function initializeAdminRole(): Promise<void> {
  try {
    console.log("Initializing admin role permissions...");
    
    // Find or create the admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (roleError) {
      console.error("Error finding admin role:", roleError);
      return;
    }
    
    if (!adminRole) {
      console.error("Admin role not found");
      return;
    }
    
    // Get all permissions
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id');
    
    if (permError) {
      console.error("Error fetching permissions:", permError);
      return;
    }
    
    if (!permissions || permissions.length === 0) {
      console.error("No permissions found");
      return;
    }
    
    // Prepare role permission records
    const rolePermissions = permissions.map(permission => ({
      role_id: adminRole.id,
      permission_id: permission.id
    }));
    
    // First delete existing role permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', adminRole.id);
    
    if (deleteError) {
      console.error("Error deleting existing role permissions:", deleteError);
      return;
    }
    
    // Insert new role permissions in batches
    for (let i = 0; i < rolePermissions.length; i += 25) { // Process in batches of 25
      const batch = rolePermissions.slice(i, i + 25);
      const { error } = await supabase
        .from('role_permissions')
        .insert(batch);
      
      if (error) {
        console.error("Error inserting role permissions batch:", error);
      }
    }
    
    console.log("Admin role permissions initialized with", permissions.length, "permissions");
  } catch (error) {
    console.error("Error initializing admin role permissions:", error);
  }
}
