
-- Create permissions for each module

-- First make sure permissions table exists
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL,
  type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Documents permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('documents_view', 'عرض المستندات', 'documents', 'view'),
  ('documents_create', 'إنشاء مستندات جديدة', 'documents', 'create'),
  ('documents_edit', 'تعديل المستندات', 'documents', 'edit'),
  ('documents_delete', 'حذف المستندات', 'documents', 'delete'),
  ('documents_download', 'تنزيل المستندات', 'documents', 'download'),
  ('documents_approve', 'اعتماد المستندات', 'documents', 'approve')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Events permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('events_view', 'عرض الفعاليات', 'events', 'view'),
  ('events_create', 'إنشاء فعاليات جديدة', 'events', 'create'),
  ('events_edit', 'تعديل الفعاليات', 'events', 'edit'),
  ('events_delete', 'حذف الفعاليات', 'events', 'delete'),
  ('events_register', 'التسجيل في الفعاليات', 'events', 'register'),
  ('events_manage_registrations', 'إدارة تسجيلات الفعاليات', 'events', 'manage')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Tasks permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('tasks_view', 'عرض المهام', 'tasks', 'view'),
  ('tasks_create', 'إنشاء مهام جديدة', 'tasks', 'create'),
  ('tasks_edit', 'تعديل المهام', 'tasks', 'edit'),
  ('tasks_delete', 'حذف المهام', 'tasks', 'delete'),
  ('tasks_assign', 'إسناد المهام', 'tasks', 'assign'),
  ('tasks_complete', 'إكمال المهام', 'tasks', 'complete')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Finance permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('finance_view', 'عرض البيانات المالية', 'finance', 'view'),
  ('finance_create', 'إنشاء سجلات مالية جديدة', 'finance', 'create'),
  ('finance_edit', 'تعديل السجلات المالية', 'finance', 'edit'),
  ('finance_delete', 'حذف السجلات المالية', 'finance', 'delete'),
  ('finance_approve', 'اعتماد العمليات المالية', 'finance', 'approve'),
  ('finance_export', 'تصدير التقارير المالية', 'finance', 'export')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Projects permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('projects_view', 'عرض المشاريع', 'projects', 'view'),
  ('projects_create', 'إنشاء مشاريع جديدة', 'projects', 'create'),
  ('projects_edit', 'تعديل المشاريع', 'projects', 'edit'),
  ('projects_delete', 'حذف المشاريع', 'projects', 'delete'),
  ('projects_manage_members', 'إدارة أعضاء المشروع', 'projects', 'manage_members'),
  ('projects_manage_activities', 'إدارة أنشطة المشروع', 'projects', 'manage_activities')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Requests permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('requests_view', 'عرض الطلبات', 'requests', 'view'),
  ('requests_create', 'إنشاء طلبات جديدة', 'requests', 'create'),
  ('requests_edit', 'تعديل الطلبات', 'requests', 'edit'),
  ('requests_delete', 'حذف الطلبات', 'requests', 'delete'),
  ('requests_approve', 'اعتماد الطلبات', 'requests', 'approve'),
  ('requests_reject', 'رفض الطلبات', 'requests', 'reject')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Users permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('users_view', 'عرض المستخدمين', 'users', 'view'),
  ('users_create', 'إنشاء مستخدمين جدد', 'users', 'create'),
  ('users_edit', 'تعديل بيانات المستخدمين', 'users', 'edit'),
  ('users_delete', 'حذف المستخدمين', 'users', 'delete'),
  ('users_manage_roles', 'إدارة أدوار المستخدمين', 'users', 'manage_roles')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Settings permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('settings_view', 'عرض الإعدادات', 'settings', 'view'),
  ('settings_edit', 'تعديل الإعدادات', 'settings', 'edit'),
  ('settings_manage_system', 'إدارة إعدادات النظام', 'settings', 'manage')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Developer permissions
INSERT INTO public.permissions (name, description, module, type)
VALUES
  ('developer_view_logs', 'عرض سجلات النظام', 'developer', 'view'),
  ('developer_manage_permissions', 'إدارة الصلاحيات', 'developer', 'manage'),
  ('developer_manage_system', 'إدارة النظام', 'developer', 'manage'),
  ('developer_access_tools', 'الوصول لأدوات المطور', 'developer', 'access')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  type = EXCLUDED.type;

-- Maintain existing apps_visibility permissions
UPDATE public.permissions
SET module = 'apps_visibility', type = 'view'
WHERE name LIKE 'view_%_app';
