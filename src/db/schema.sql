
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
