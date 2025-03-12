
-- Fix permissions table structure if needed
ALTER TABLE public.permissions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

ALTER TABLE public.permissions 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update display_name where null
UPDATE public.permissions
SET display_name = name
WHERE display_name IS NULL;

-- Ensure categories and displays are set correctly for better organization
-- Events module (الفعاليات)
UPDATE public.permissions 
SET 
  category = 'read',
  display_name = 'عرض جميع الفعاليات'
WHERE module = 'الفعاليات' AND name = 'events_view_all';

UPDATE public.permissions 
SET 
  category = 'create',
  display_name = 'إنشاء فعاليات جديدة'
WHERE module = 'الفعاليات' AND name = 'events_create';

UPDATE public.permissions 
SET 
  category = 'update',
  display_name = 'تعديل الفعاليات'
WHERE module = 'الفعاليات' AND name = 'events_edit';

UPDATE public.permissions 
SET 
  category = 'delete',
  display_name = 'حذف الفعاليات'
WHERE module = 'الفعاليات' AND name = 'events_delete';

UPDATE public.permissions 
SET 
  category = 'participants',
  display_name = 'إدارة المشاركين'
WHERE module = 'الفعاليات' AND name = 'events_manage_participants';

UPDATE public.permissions 
SET 
  category = 'reports',
  display_name = 'عرض التقارير'
WHERE module = 'الفعاليات' AND name = 'events_view_reports';

-- Users module (المستخدمين)
UPDATE public.permissions 
SET 
  category = 'read',
  display_name = 'عرض جميع المستخدمين'
WHERE module = 'المستخدمين' AND name = 'users_view_all';

UPDATE public.permissions 
SET 
  category = 'create',
  display_name = 'إنشاء مستخدمين'
WHERE module = 'المستخدمين' AND name = 'users_create';

UPDATE public.permissions 
SET 
  category = 'update',
  display_name = 'تعديل المستخدمين'
WHERE module = 'المستخدمين' AND name = 'users_edit';

UPDATE public.permissions 
SET 
  category = 'admin',
  display_name = 'إدارة الأدوار'
WHERE module = 'المستخدمين' AND name = 'users_manage_roles';

-- Tasks module (المهام)
UPDATE public.permissions 
SET 
  category = 'read',
  display_name = 'عرض جميع المهام'
WHERE module = 'المهام' AND name = 'tasks_view_all';

UPDATE public.permissions 
SET 
  category = 'create',
  display_name = 'إنشاء مهام'
WHERE module = 'المهام' AND name = 'tasks_create';

UPDATE public.permissions 
SET 
  category = 'update',
  display_name = 'تعديل المهام'
WHERE module = 'المهام' AND name = 'tasks_edit';

UPDATE public.permissions 
SET 
  category = 'delete',
  display_name = 'حذف المهام'
WHERE module = 'المهام' AND name = 'tasks_delete';

UPDATE public.permissions 
SET 
  category = 'admin',
  display_name = 'إسناد المهام'
WHERE module = 'المهام' AND name = 'tasks_assign';

-- Developer module (أدوات المطور)
UPDATE public.permissions 
SET 
  category = 'access',
  display_name = 'الوصول لأدوات المطور'
WHERE module = 'أدوات المطور' AND name = 'developer_access';

UPDATE public.permissions 
SET 
  category = 'admin',
  display_name = 'إدارة إعدادات النظام'
WHERE module = 'أدوات المطور' AND name = 'developer_manage_system';

-- Make sure all permissions have proper categories
UPDATE public.permissions
SET category = 'general'
WHERE category IS NULL;

-- Recreate the view with additional category information
DROP VIEW IF EXISTS permission_categories_view;
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
