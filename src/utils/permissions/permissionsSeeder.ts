
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Permission definitions by application with categories
const permissionsData = {
  // Requests application permissions
  requests: [
    // Access category - basic access controls
    { name: 'access_app', description: 'الوصول إلى تطبيق إدارة الطلبات', category: 'access' },
    
    // Create category
    { name: 'create_request', description: 'إنشاء طلب جديد', category: 'create' },
    { name: 'create_request_type', description: 'إنشاء نوع طلب جديد', category: 'create' },
    { name: 'create_workflow', description: 'إنشاء مسار عمل جديد', category: 'create' },
    { name: 'create_workflow_template', description: 'إنشاء قالب مسار عمل', category: 'create' },
    
    // Read category
    { name: 'view_own_requests', description: 'عرض الطلبات الخاصة', category: 'read' },
    { name: 'view_all_requests', description: 'عرض جميع الطلبات', category: 'read' },
    { name: 'view_request_types', description: 'عرض أنواع الطلبات', category: 'read' },
    { name: 'view_workflows', description: 'عرض مسارات العمل', category: 'read' },
    
    // Update category
    { name: 'edit_own_requests', description: 'تعديل الطلبات الخاصة', category: 'update' },
    { name: 'edit_all_requests', description: 'تعديل جميع الطلبات', category: 'update' },
    { name: 'edit_request_types', description: 'تعديل أنواع الطلبات', category: 'update' },
    { name: 'edit_workflows', description: 'تعديل مسارات العمل', category: 'update' },
    
    // Delete category
    { name: 'delete_own_requests', description: 'حذف الطلبات الخاصة', category: 'delete' },
    { name: 'delete_all_requests', description: 'حذف جميع الطلبات', category: 'delete' },
    { name: 'delete_request_types', description: 'حذف أنواع الطلبات', category: 'delete' },
    { name: 'delete_workflows', description: 'حذف مسارات العمل', category: 'delete' },
    
    // Workflow category - process flow permissions
    { name: 'participate_in_opinion', description: 'المشاركة في إبداء الرأي', category: 'workflow' },
    { name: 'participate_in_decision', description: 'المشاركة في اتخاذ القرار', category: 'workflow' },
    { name: 'override_approval', description: 'تجاوز الموافقات', category: 'workflow' },
    { name: 'assign_approvers', description: 'تعيين معتمدين للطلبات', category: 'workflow' },
    
    // Admin category
    { name: 'manage_request_settings', description: 'إدارة إعدادات الطلبات', category: 'admin' },
    { name: 'view_request_logs', description: 'عرض سجلات الطلبات', category: 'admin' },
    { name: 'manage_attachments', description: 'إدارة المرفقات', category: 'admin' },
    { name: 'export_requests', description: 'تصدير الطلبات', category: 'admin' }
  ],
  
  // Events application permissions
  events: [
    // Access category
    { name: 'access_app', description: 'الوصول إلى تطبيق إدارة الفعاليات', category: 'access' },
    
    // Create category
    { name: 'create_event', description: 'إنشاء فعالية جديدة', category: 'create' },
    { name: 'create_event_type', description: 'إنشاء نوع فعالية جديد', category: 'create' },
    { name: 'create_venue', description: 'إنشاء مكان فعالية جديد', category: 'create' },
    
    // Read category
    { name: 'view_own_events', description: 'عرض الفعاليات الخاصة', category: 'read' },
    { name: 'view_all_events', description: 'عرض جميع الفعاليات', category: 'read' },
    { name: 'view_event_attendees', description: 'عرض حضور الفعاليات', category: 'read' },
    { name: 'view_event_stats', description: 'عرض إحصائيات الفعاليات', category: 'read' },
    
    // Update category
    { name: 'edit_own_events', description: 'تعديل الفعاليات الخاصة', category: 'update' },
    { name: 'edit_all_events', description: 'تعديل جميع الفعاليات', category: 'update' },
    { name: 'edit_event_types', description: 'تعديل أنواع الفعاليات', category: 'update' },
    { name: 'edit_venues', description: 'تعديل أماكن الفعاليات', category: 'update' },
    
    // Delete category
    { name: 'delete_own_events', description: 'حذف الفعاليات الخاصة', category: 'delete' },
    { name: 'delete_all_events', description: 'حذف جميع الفعاليات', category: 'delete' },
    
    // Admin category
    { name: 'approve_events', description: 'اعتماد الفعاليات', category: 'admin' },
    { name: 'manage_budget', description: 'إدارة ميزانية الفعاليات', category: 'admin' },
    { name: 'manage_event_staff', description: 'إدارة فريق الفعاليات', category: 'admin' },
    { name: 'export_events', description: 'تصدير الفعاليات', category: 'admin' }
  ],
  
  // Tasks application permissions
  tasks: [
    // Access category
    { name: 'access_app', description: 'الوصول إلى تطبيق إدارة المهام', category: 'access' },
    
    // Create category
    { name: 'create_task', description: 'إنشاء مهمة جديدة', category: 'create' },
    { name: 'create_project', description: 'إنشاء مشروع جديد', category: 'create' },
    { name: 'create_workspace', description: 'إنشاء مساحة عمل جديدة', category: 'create' },
    
    // Read category
    { name: 'view_own_tasks', description: 'عرض المهام الخاصة', category: 'read' },
    { name: 'view_all_tasks', description: 'عرض جميع المهام', category: 'read' },
    { name: 'view_projects', description: 'عرض المشاريع', category: 'read' },
    { name: 'view_workspaces', description: 'عرض مساحات العمل', category: 'read' },
    
    // Update category
    { name: 'edit_own_tasks', description: 'تعديل المهام الخاصة', category: 'update' },
    { name: 'edit_all_tasks', description: 'تعديل جميع المهام', category: 'update' },
    { name: 'edit_projects', description: 'تعديل المشاريع', category: 'update' },
    { name: 'edit_workspaces', description: 'تعديل مساحات العمل', category: 'update' },
    
    // Delete category
    { name: 'delete_own_tasks', description: 'حذف المهام الخاصة', category: 'delete' },
    { name: 'delete_all_tasks', description: 'حذف جميع المهام', category: 'delete' },
    { name: 'delete_projects', description: 'حذف المشاريع', category: 'delete' },
    
    // Admin category
    { name: 'manage_task_settings', description: 'إدارة إعدادات المهام', category: 'admin' },
    { name: 'assign_tasks', description: 'تعيين مسؤولين للمهام', category: 'admin' },
    { name: 'export_tasks', description: 'تصدير المهام', category: 'admin' }
  ],
  
  // Users management permissions
  users: [
    // Access category
    { name: 'access_app', description: 'الوصول إلى إدارة المستخدمين', category: 'access' },
    
    // Create category
    { name: 'create_user', description: 'إنشاء مستخدم جديد', category: 'create' },
    { name: 'create_role', description: 'إنشاء دور جديد', category: 'create' },
    
    // Read category
    { name: 'view_users', description: 'عرض المستخدمين', category: 'read' },
    { name: 'view_roles', description: 'عرض الأدوار', category: 'read' },
    { name: 'view_permissions', description: 'عرض الصلاحيات', category: 'read' },
    
    // Update category
    { name: 'edit_users', description: 'تعديل المستخدمين', category: 'update' },
    { name: 'edit_roles', description: 'تعديل الأدوار', category: 'update' },
    { name: 'assign_roles', description: 'تعيين الأدوار للمستخدمين', category: 'update' },
    { name: 'edit_permissions', description: 'تعديل الصلاحيات', category: 'update' },
    
    // Delete category
    { name: 'delete_users', description: 'حذف المستخدمين', category: 'delete' },
    { name: 'delete_roles', description: 'حذف الأدوار', category: 'delete' },
    
    // Admin category
    { name: 'manage_user_settings', description: 'إدارة إعدادات المستخدمين', category: 'admin' },
    { name: 'view_user_activity', description: 'عرض نشاط المستخدمين', category: 'admin' },
    { name: 'reset_passwords', description: 'إعادة تعيين كلمات المرور', category: 'admin' }
  ],
  
  // Developer tools permissions
  developer: [
    // Access category
    { name: 'access_app', description: 'الوصول إلى أدوات المطور', category: 'access' },
    
    // Read category
    { name: 'view_api_logs', description: 'عرض سجلات API', category: 'read' },
    { name: 'view_error_logs', description: 'عرض سجلات الأخطاء', category: 'read' },
    { name: 'view_performance_metrics', description: 'عرض مقاييس الأداء', category: 'read' },
    
    // Admin category
    { name: 'manage_system_settings', description: 'إدارة إعدادات النظام', category: 'admin' },
    { name: 'run_database_queries', description: 'تنفيذ استعلامات قاعدة البيانات', category: 'admin' },
    { name: 'manage_feature_flags', description: 'إدارة ميزات النظام', category: 'admin' }
  ]
};

/**
 * Seed the permissions table with predefined permissions
 */
export const seedPermissions = async (): Promise<void> => {
  try {
    // Check if we need to seed by checking if permissions table is empty
    const { count, error: countError } = await supabase
      .from('permissions')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    // If we already have permissions, don't seed again
    if (count && count > 0) {
      console.log(`Permissions table already has ${count} records, skipping seed`);
      return;
    }
    
    console.log('Seeding permissions table...');
    
    // Collect all permissions in a flat array for insertion
    const allPermissions = Object.entries(permissionsData).flatMap(([module, permissions]) => 
      permissions.map(permission => ({
        ...permission,
        module
      }))
    );
    
    // Insert permissions in batches of 50
    const batchSize = 50;
    for (let i = 0; i < allPermissions.length; i += batchSize) {
      const batch = allPermissions.slice(i, i + batchSize);
      const { error } = await supabase.from('permissions').insert(batch);
      if (error) throw error;
      console.log(`Inserted batch ${i/batchSize + 1} of ${Math.ceil(allPermissions.length/batchSize)}`);
    }
    
    console.log(`Successfully seeded ${allPermissions.length} permissions`);
    toast.success('تم تهيئة جدول الصلاحيات بنجاح');
  } catch (error) {
    console.error('Error seeding permissions:', error);
    toast.error('حدث خطأ أثناء تهيئة جدول الصلاحيات');
  }
};

/**
 * Seed default role permissions for common roles
 */
export const seedRolePermissions = async (): Promise<void> => {
  try {
    // Get all permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id, name, module');
      
    if (permissionsError) throw permissionsError;
    
    // Get roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name');
      
    if (rolesError) throw rolesError;
    
    // Role permission mappings - which permissions each role should have
    const rolePermissionMappings: Record<string, string[]> = {
      // Developer gets all permissions
      'developer': permissions.map(p => p.id),
      
      // Admin gets all permissions
      'admin': permissions.map(p => p.id),
      
      // App admin gets all permissions
      'app_admin': permissions.map(p => p.id),
      
      // Event creator gets event-specific permissions
      'event_creator': permissions
        .filter(p => (
          p.module === 'events' && 
          (p.name.startsWith('create_') || 
           p.name.startsWith('view_') || 
           p.name.startsWith('edit_own_') ||
           p.name.startsWith('delete_own_') ||
           p.name === 'access_app')
        ))
        .map(p => p.id),
      
      // Request manager gets request-specific permissions
      'request_manager': permissions
        .filter(p => (
          p.module === 'requests' && 
          !p.name.includes('delete_') &&
          !p.name.includes('override_')
        ))
        .map(p => p.id)
    };
    
    // For each role in the mapping
    for (const [roleName, permissionIds] of Object.entries(rolePermissionMappings)) {
      // Find the role
      const role = roles.find(r => r.name === roleName);
      if (!role) {
        console.log(`Role ${roleName} not found, skipping`);
        continue;
      }
      
      // Check if role already has permissions
      const { count, error: countError } = await supabase
        .from('role_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', role.id);
        
      if (countError) throw countError;
      
      // If role already has permissions, skip
      if (count && count > 0) {
        console.log(`Role ${roleName} already has ${count} permissions, skipping`);
        continue;
      }
      
      // Create role permissions entries
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: role.id,
        permission_id: permissionId
      }));
      
      // Insert in batches
      const batchSize = 50;
      for (let i = 0; i < rolePermissions.length; i += batchSize) {
        const batch = rolePermissions.slice(i, i + batchSize);
        const { error } = await supabase.from('role_permissions').insert(batch);
        if (error) throw error;
      }
      
      console.log(`Added ${permissionIds.length} permissions to role ${roleName}`);
    }
    
    toast.success('تم تهيئة صلاحيات الأدوار الافتراضية بنجاح');
  } catch (error) {
    console.error('Error seeding role permissions:', error);
    toast.error('حدث خطأ أثناء تهيئة صلاحيات الأدوار');
  }
};

/**
 * Initialize the permissions system
 */
export const initializePermissionsSystem = async (): Promise<void> => {
  await seedPermissions();
  await seedRolePermissions();
};
