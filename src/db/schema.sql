
-- تحديث جدول task_comments لدعم المرفقات
ALTER TABLE IF EXISTS task_comments 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- تحديث جدول portfolio_task_comments لدعم المرفقات
ALTER TABLE IF EXISTS portfolio_task_comments 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- تحديث جدول certificate_templates لدعم الفئات والأرشفة
ALTER TABLE IF EXISTS certificate_templates
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- تحديث جدول certificate_verifications لتحسين نظام التحقق
ALTER TABLE IF EXISTS certificate_verifications
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'direct';
