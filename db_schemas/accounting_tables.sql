
-- جدول الحسابات (شجرة الحسابات)
CREATE TABLE IF NOT EXISTS accounting_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES accounting_accounts(id),
  level INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء مؤشر للبحث السريع بالكود والاسم
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_code ON accounting_accounts (code);
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_name ON accounting_accounts (name);
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_parent ON accounting_accounts (parent_id);

-- جدول القيود المحاسبية
CREATE TABLE IF NOT EXISTS accounting_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reference_number VARCHAR(100),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(15, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id)
);

-- إنشاء مؤشر للبحث بتاريخ القيد ورقمه
CREATE INDEX IF NOT EXISTS idx_accounting_journal_entries_date ON accounting_journal_entries (date);
CREATE INDEX IF NOT EXISTS idx_accounting_journal_entries_reference ON accounting_journal_entries (reference_number);

-- جدول بنود القيود المحاسبية
CREATE TABLE IF NOT EXISTS accounting_journal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES accounting_journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounting_accounts(id),
  description TEXT,
  debit_amount NUMERIC(15, 2) DEFAULT 0,
  credit_amount NUMERIC(15, 2) DEFAULT 0,
  cost_center_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء مؤشر للعلاقات
CREATE INDEX IF NOT EXISTS idx_accounting_journal_items_entry ON accounting_journal_items (journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_accounting_journal_items_account ON accounting_journal_items (account_id);

-- جدول مراكز التكلفة
CREATE TABLE IF NOT EXISTS accounting_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء مؤشر للبحث بالكود والإسم
CREATE INDEX IF NOT EXISTS idx_accounting_cost_centers_code ON accounting_cost_centers (code);
CREATE INDEX IF NOT EXISTS idx_accounting_cost_centers_name ON accounting_cost_centers (name);

-- جدول الفترات المالية
CREATE TABLE IF NOT EXISTS accounting_fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول إعدادات المحاسبة
CREATE TABLE IF NOT EXISTS accounting_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التوثيق والمستندات
CREATE TABLE IF NOT EXISTS accounting_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID NOT NULL,
  reference_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء مؤشر للمستندات
CREATE INDEX IF NOT EXISTS idx_accounting_documents_reference ON accounting_documents (reference_id, reference_type);

-- إضافة دالة لتحديث حقل updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_accounting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المحفزات (triggers) لتحديث حقل updated_at تلقائياً
CREATE TRIGGER update_accounting_accounts_timestamp
BEFORE UPDATE ON accounting_accounts
FOR EACH ROW EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_accounting_journal_entries_timestamp
BEFORE UPDATE ON accounting_journal_entries
FOR EACH ROW EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_accounting_cost_centers_timestamp
BEFORE UPDATE ON accounting_cost_centers
FOR EACH ROW EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_accounting_fiscal_periods_timestamp
BEFORE UPDATE ON accounting_fiscal_periods
FOR EACH ROW EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_accounting_settings_timestamp
BEFORE UPDATE ON accounting_settings
FOR EACH ROW EXECUTE FUNCTION update_accounting_updated_at();

-- إنشاء سياسات أمان RLS للجداول
ALTER TABLE accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_journal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_documents ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للقراءة العامة (لجميع المستخدمين المسجلين)
CREATE POLICY "يمكن للمستخدمين المصرح لهم قراءة الحسابات" 
ON accounting_accounts FOR SELECT 
USING (auth.uid() IN (
  SELECT ur.user_id 
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name IN ('admin', 'app_admin', 'developer', 'accountant', 'financial_manager')
));

CREATE POLICY "يمكن للمستخدمين المصرح لهم قراءة القيود المحاسبية" 
ON accounting_journal_entries FOR SELECT 
USING (auth.uid() IN (
  SELECT ur.user_id 
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name IN ('admin', 'app_admin', 'developer', 'accountant', 'financial_manager')
));

-- إنشاء سياسة للتعديل (للمحاسبين والمديرين الماليين فقط)
CREATE POLICY "يمكن للمحاسبين والمديرين الماليين تعديل الحسابات" 
ON accounting_accounts FOR ALL
USING (auth.uid() IN (
  SELECT ur.user_id 
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name IN ('admin', 'app_admin', 'developer', 'financial_manager', 'accountant')
));

CREATE POLICY "يمكن للمحاسبين والمديرين الماليين تعديل القيود المحاسبية" 
ON accounting_journal_entries FOR ALL
USING (auth.uid() IN (
  SELECT ur.user_id 
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name IN ('admin', 'app_admin', 'developer', 'financial_manager', 'accountant')
));

-- إنشاء بعض الحسابات الافتراضية
INSERT INTO accounting_accounts (code, name, account_type, level, is_active)
VALUES 
  ('1000', 'الأصول', 'asset', 0, true),
  ('2000', 'الالتزامات', 'liability', 0, true),
  ('3000', 'حقوق الملكية', 'equity', 0, true),
  ('4000', 'الإيرادات', 'revenue', 0, true),
  ('5000', 'المصروفات', 'expense', 0, true)
ON CONFLICT (code) DO NOTHING;

-- إنشاء حسابات فرعية للأصول
INSERT INTO accounting_accounts (code, name, account_type, parent_id, level, is_active)
VALUES 
  ('1100', 'الأصول المتداولة', 'asset', 
    (SELECT id FROM accounting_accounts WHERE code = '1000'), 1, true),
  ('1200', 'الأصول الثابتة', 'asset', 
    (SELECT id FROM accounting_accounts WHERE code = '1000'), 1, true)
ON CONFLICT (code) DO NOTHING;

-- إنشاء حسابات تفصيلية للأصول المتداولة
INSERT INTO accounting_accounts (code, name, account_type, parent_id, level, is_active)
VALUES 
  ('1110', 'النقد والأرصدة البنكية', 'asset', 
    (SELECT id FROM accounting_accounts WHERE code = '1100'), 2, true),
  ('1120', 'الذمم المدينة', 'asset', 
    (SELECT id FROM accounting_accounts WHERE code = '1100'), 2, true)
ON CONFLICT (code) DO NOTHING;
