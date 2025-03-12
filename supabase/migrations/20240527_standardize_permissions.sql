
-- First, make sure we have Arabic module names for all permissions
UPDATE public.permissions 
SET module = 'الفعاليات'
WHERE module = 'events';

UPDATE public.permissions 
SET module = 'المستخدمين'
WHERE module = 'users';

UPDATE public.permissions 
SET module = 'المهام'
WHERE module = 'tasks';

UPDATE public.permissions 
SET module = 'المستندات'
WHERE module = 'documents';

UPDATE public.permissions 
SET module = 'الأفكار'
WHERE module = 'ideas';

UPDATE public.permissions 
SET module = 'الإعدادات'
WHERE module = 'settings';

UPDATE public.permissions 
SET module = 'الإشعارات'
WHERE module = 'notifications';

UPDATE public.permissions 
SET module = 'أدوات المطور'
WHERE module = 'developer';

UPDATE public.permissions 
SET module = 'الطلبات'
WHERE module = 'requests';

UPDATE public.permissions 
SET module = 'المالية'
WHERE module = 'finance';

UPDATE public.permissions 
SET module = 'الموقع الإلكتروني'
WHERE module = 'website';

UPDATE public.permissions 
SET module = 'المتجر الإلكتروني'
WHERE module = 'store';

-- Make sure all permissions have a display name
UPDATE public.permissions
SET display_name = name
WHERE display_name IS NULL;

-- Add categories to permissions that don't have them
UPDATE public.permissions
SET category = 'general'
WHERE category IS NULL;

-- Make sure we have basic permissions for each module
-- الفعاليات (Events)
INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'events_view_all', 'عرض جميع الفعاليات', 'الفعاليات', 'read', 'عرض جميع الفعاليات'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'events_view_all' AND module = 'الفعاليات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'events_create', 'إنشاء فعاليات جديدة', 'الفعاليات', 'create', 'إنشاء فعاليات جديدة'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'events_create' AND module = 'الفعاليات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'events_edit', 'تعديل الفعاليات', 'الفعاليات', 'update', 'تعديل الفعاليات'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'events_edit' AND module = 'الفعاليات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'events_delete', 'حذف الفعاليات', 'الفعاليات', 'delete', 'حذف الفعاليات'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'events_delete' AND module = 'الفعاليات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'events_manage_participants', 'إدارة المشاركين في الفعاليات', 'الفعاليات', 'participants', 'إدارة المشاركين'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'events_manage_participants' AND module = 'الفعاليات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'events_view_reports', 'عرض تقارير الفعاليات', 'الفعاليات', 'reports', 'عرض التقارير'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'events_view_reports' AND module = 'الفعاليات'
);

-- المستخدمين (Users)
INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'users_view_all', 'عرض جميع المستخدمين', 'المستخدمين', 'read', 'عرض جميع المستخدمين'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'users_view_all' AND module = 'المستخدمين'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'users_create', 'إنشاء مستخدمين جدد', 'المستخدمين', 'create', 'إنشاء مستخدمين'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'users_create' AND module = 'المستخدمين'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'users_edit', 'تعديل بيانات المستخدمين', 'المستخدمين', 'update', 'تعديل المستخدمين'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'users_edit' AND module = 'المستخدمين'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'users_manage_roles', 'إدارة أدوار المستخدمين', 'المستخدمين', 'admin', 'إدارة الأدوار'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'users_manage_roles' AND module = 'المستخدمين'
);

-- المهام (Tasks)
INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'tasks_view_all', 'عرض جميع المهام', 'المهام', 'read', 'عرض جميع المهام'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'tasks_view_all' AND module = 'المهام'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'tasks_create', 'إنشاء مهام جديدة', 'المهام', 'create', 'إنشاء مهام'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'tasks_create' AND module = 'المهام'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'tasks_edit', 'تعديل المهام', 'المهام', 'update', 'تعديل المهام'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'tasks_edit' AND module = 'المهام'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'tasks_delete', 'حذف المهام', 'المهام', 'delete', 'حذف المهام'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'tasks_delete' AND module = 'المهام'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'tasks_assign', 'إسناد المهام للمستخدمين', 'المهام', 'admin', 'إسناد المهام'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'tasks_assign' AND module = 'المهام'
);

-- باقي الوحدات (يمكن إضافة المزيد من الصلاحيات حسب الحاجة)
-- أدوات المطور (Developer)
INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'developer_access', 'الوصول إلى أدوات المطور', 'أدوات المطور', 'access', 'الوصول لأدوات المطور'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'developer_access' AND module = 'أدوات المطور'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'developer_manage_system', 'إدارة إعدادات النظام', 'أدوات المطور', 'admin', 'إدارة إعدادات النظام'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'developer_manage_system' AND module = 'أدوات المطور'
);

-- الطلبات (Requests)
INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'requests_view_all', 'عرض جميع الطلبات', 'الطلبات', 'read', 'عرض جميع الطلبات'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'requests_view_all' AND module = 'الطلبات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'requests_create', 'إنشاء طلبات جديدة', 'الطلبات', 'create', 'إنشاء طلبات'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'requests_create' AND module = 'الطلبات'
);

INSERT INTO public.permissions (name, description, module, category, display_name)
SELECT 'requests_manage_workflow', 'إدارة سير عمل الطلبات', 'الطلبات', 'workflow', 'إدارة سير العمل'
WHERE NOT EXISTS (
    SELECT 1 FROM public.permissions 
    WHERE name = 'requests_manage_workflow' AND module = 'الطلبات'
);

-- Create a view to make querying permissions easier
CREATE OR REPLACE VIEW permission_categories_view AS
SELECT 
  module,
  category,
  count(*) as permission_count
FROM 
  permissions
GROUP BY 
  module, category
ORDER BY 
  module, category;
