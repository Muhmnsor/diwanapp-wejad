
-- نظام الصلاحيات الموسع

-- إنشاء جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- مؤشر على اسم الصلاحية للبحث السريع
CREATE INDEX IF NOT EXISTS permissions_name_idx ON permissions (name);
CREATE INDEX IF NOT EXISTS permissions_module_idx ON permissions (module);

-- جدول لربط الأدوار والصلاحيات
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(role_id, permission_id)
);

-- إنشاء جدول خاص بإعدادات التطبيقات وظهورها
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_key TEXT UNIQUE NOT NULL,
  app_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  path TEXT,
  is_visible BOOLEAN DEFAULT true,
  requires_permission BOOLEAN DEFAULT true,
  permission_key TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- جدول خاص بصلاحيات التطوير
CREATE TABLE IF NOT EXISTS developer_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_developer BOOLEAN DEFAULT false,
  can_access_developer_tools BOOLEAN DEFAULT false,
  can_modify_system_settings BOOLEAN DEFAULT false, 
  can_access_api_logs BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- جدول لإعدادات وضع المطور
CREATE TABLE IF NOT EXISTS developer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'system',
  show_dev_tools BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- دالة للتحقق من وجود صلاحية معينة للدور
CREATE OR REPLACE FUNCTION has_permission(role_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = $1 AND p.name = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من وجود صلاحية معينة للمستخدم
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = $1 AND p.name = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إدخال بعض الصلاحيات الأساسية للنظام
INSERT INTO permissions (name, description, module)
VALUES
  -- صلاحيات النظام الأساسية
  ('admin_access', 'الوصول إلى لوحة التحكم الإدارية', 'system'),
  ('system_settings', 'إدارة إعدادات النظام', 'system'),
  ('users_view', 'عرض المستخدمين', 'users'),
  ('users_create', 'إنشاء مستخدمين جدد', 'users'),
  ('users_edit', 'تعديل بيانات المستخدمين', 'users'),
  ('users_delete', 'حذف المستخدمين', 'users'),
  ('roles_view', 'عرض الأدوار', 'users'),
  ('roles_create', 'إنشاء أدوار جديدة', 'users'),
  ('roles_edit', 'تعديل الأدوار', 'users'),
  ('roles_delete', 'حذف الأدوار', 'users'),
  ('permissions_view', 'عرض الصلاحيات', 'users'),
  ('permissions_edit', 'تعديل الصلاحيات', 'users'),
  
  -- صلاحيات الفعاليات
  ('events_view', 'عرض الفعاليات', 'events'),
  ('events_create', 'إنشاء فعاليات جديدة', 'events'),
  ('events_edit', 'تعديل الفعاليات', 'events'),
  ('events_delete', 'حذف الفعاليات', 'events'),
  ('events_manage', 'إدارة تفاصيل الفعاليات', 'events'),
  ('events_reports', 'عرض تقارير الفعاليات', 'events'),
  
  -- صلاحيات المستندات
  ('documents_view', 'عرض المستندات', 'documents'),
  ('documents_upload', 'رفع مستندات جديدة', 'documents'),
  ('documents_edit', 'تعديل المستندات', 'documents'),
  ('documents_delete', 'حذف المستندات', 'documents'),
  
  -- صلاحيات المهام
  ('tasks_view', 'عرض المهام', 'tasks'),
  ('tasks_create', 'إنشاء مهام جديدة', 'tasks'),
  ('tasks_edit', 'تعديل المهام', 'tasks'),
  ('tasks_delete', 'حذف المهام', 'tasks'),
  ('tasks_assign', 'إسناد المهام', 'tasks'),
  
  -- صلاحيات الأفكار
  ('ideas_view', 'عرض الأفكار', 'ideas'),
  ('ideas_create', 'إضافة أفكار جديدة', 'ideas'),
  ('ideas_edit', 'تعديل الأفكار', 'ideas'),
  ('ideas_delete', 'حذف الأفكار', 'ideas'),
  ('ideas_approve', 'الموافقة على الأفكار', 'ideas'),
  
  -- صلاحيات المالية
  ('finance_view', 'عرض البيانات المالية', 'finance'),
  ('finance_create', 'إضافة معاملات مالية', 'finance'),
  ('finance_edit', 'تعديل المعاملات المالية', 'finance'),
  ('finance_delete', 'حذف المعاملات المالية', 'finance'),
  ('finance_approve', 'اعتماد المعاملات المالية', 'finance'),
  ('finance_reports', 'عرض التقارير المالية', 'finance'),
  
  -- صلاحيات الموقع الإلكتروني
  ('website_view', 'عرض محتوى الموقع', 'website'),
  ('website_edit', 'تعديل محتوى الموقع', 'website'),
  ('website_publish', 'نشر محتوى جديد', 'website'),
  
  -- صلاحيات المتجر الإلكتروني
  ('store_view', 'عرض المتجر', 'store'),
  ('store_products_edit', 'إدارة المنتجات', 'store'),
  ('store_orders_view', 'عرض الطلبات', 'store'),
  ('store_orders_manage', 'إدارة الطلبات', 'store'),
  
  -- صلاحيات الإشعارات
  ('notifications_view', 'عرض الإشعارات', 'notifications'),
  ('notifications_send', 'إرسال إشعارات', 'notifications'),
  ('notifications_manage', 'إدارة إعدادات الإشعارات', 'notifications'),
  
  -- صلاحيات الطلبات
  ('requests_view', 'عرض الطلبات', 'requests'),
  ('requests_create', 'إنشاء طلبات جديدة', 'requests'),
  ('requests_edit', 'تعديل الطلبات', 'requests'),
  ('requests_approve', 'اعتماد الطلبات', 'requests'),
  ('requests_delete', 'حذف الطلبات', 'requests'),
  
  -- صلاحيات التطوير
  ('developer_tools', 'استخدام أدوات المطور', 'development'),
  ('developer_logs', 'عرض سجلات النظام', 'development'),
  ('developer_api', 'الوصول إلى واجهة برمجة التطبيقات', 'development'),
  ('developer_settings', 'تعديل إعدادات التطوير', 'development')
ON CONFLICT (id) DO NOTHING;

-- إدخال بيانات التطبيقات المركزية
INSERT INTO app_settings (app_key, app_name, description, icon, path, requires_permission, permission_key, order_index)
VALUES
  ('events', 'إدارة الفعاليات', 'إدارة وتنظيم الفعاليات والأنشطة', 'ListChecks', '/', true, 'events_view', 1),
  ('documents', 'إدارة المستندات', 'إدارة وتنظيم المستندات والملفات', 'Database', '/documents', true, 'documents_view', 2),
  ('tasks', 'إدارة المهام', 'إدارة وتتبع المهام والمشاريع', 'Clock', '/tasks', true, 'tasks_view', 3),
  ('ideas', 'إدارة الأفكار', 'إدارة وتنظيم الأفكار والمقترحات', 'Lightbulb', '/ideas', true, 'ideas_view', 4),
  ('finance', 'إدارة الأموال', 'إدارة الميزانية والمصروفات', 'DollarSign', '/finance', true, 'finance_view', 5),
  ('users', 'إدارة المستخدمين', 'إدارة حسابات المستخدمين والصلاحيات', 'Users', '/admin/users-management', true, 'users_view', 6),
  ('website', 'الموقع الإلكتروني', 'إدارة وتحديث محتوى الموقع الإلكتروني', 'Globe', '/website', true, 'website_view', 7),
  ('store', 'المتجر الإلكتروني', 'إدارة المنتجات والطلبات في المتجر الإلكتروني', 'ShoppingCart', '/store', true, 'store_view', 8),
  ('notifications', 'الإشعارات', 'عرض وإدارة إشعارات النظام', 'Bell', '/notifications', true, 'notifications_view', 9),
  ('requests', 'إدارة الطلبات', 'إدارة ومتابعة الطلبات والاستمارات والاعتمادات', 'Inbox', '/requests', true, 'requests_view', 10),
  ('developer', 'المطورين', 'إعدادات وأدوات المطورين', 'Code', '/admin/developer-settings', true, 'developer_tools', 11)
ON CONFLICT (app_key) DO UPDATE SET 
  app_name = EXCLUDED.app_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  path = EXCLUDED.path,
  order_index = EXCLUDED.order_index;

-- تعديل سياسات أمان الجداول (RLS)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_settings ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة الصلاحيات للمستخدمين المصادق عليهم
CREATE POLICY "Enable read permissions for authenticated users"
ON permissions FOR SELECT
TO authenticated
USING (true);

-- سياسة قراءة ربط الأدوار بالصلاحيات للمستخدمين المصادق عليهم
CREATE POLICY "Enable read role_permissions for authenticated users"
ON role_permissions FOR SELECT
TO authenticated
USING (true);

-- سياسة قراءة إعدادات التطبيقات للمستخدمين المصادق عليهم
CREATE POLICY "Enable read app_settings for authenticated users"
ON app_settings FOR SELECT
TO authenticated
USING (true);

-- سياسة تعديل إعدادات التطبيقات للمسؤولين فقط
CREATE POLICY "Enable update app_settings for admins only"
ON app_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'app_admin')
  )
);

-- سياسة قراءة صلاحيات المطور الخاصة بالمستخدم
CREATE POLICY "Enable read own developer_permissions"
ON developer_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'app_admin')
  )
);

-- سياسة قراءة إعدادات المطور الخاصة بالمستخدم
CREATE POLICY "Enable read own developer_settings"
ON developer_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'app_admin')
  )
);

-- سياسة تعديل إعدادات المطور الخاصة بالمستخدم
CREATE POLICY "Enable update own developer_settings"
ON developer_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
