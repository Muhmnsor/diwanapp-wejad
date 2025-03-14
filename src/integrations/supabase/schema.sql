
-- جدول لتخزين سجلات عمليات سير العمل
CREATE TABLE IF NOT EXISTS workflow_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_type TEXT NOT NULL,  -- نوع العملية (إنشاء، تحديث، حذف، إلخ)
  user_id UUID REFERENCES auth.users(id),  -- المستخدم الذي قام بالعملية
  request_type_id UUID REFERENCES request_types(id),  -- معرف نوع الطلب (اختياري)
  workflow_id UUID REFERENCES request_workflows(id),  -- معرف سير العمل (اختياري)
  step_id UUID REFERENCES workflow_steps(id),  -- معرف الخطوة (اختياري)
  request_data JSONB,  -- بيانات الطلب
  response_data JSONB,  -- بيانات الاستجابة
  error_message TEXT,  -- رسالة الخطأ إن وجدت
  details TEXT,  -- تفاصيل إضافية
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- منظر لعرض سجلات العمليات مع بيانات المستخدم واسم نوع الطلب وسير العمل
CREATE OR REPLACE VIEW workflow_operations_view AS
SELECT 
  wol.id,
  wol.operation_type,
  wol.created_at,
  p.display_name as user_name,
  p.email as user_email,
  wol.request_type_id,
  rt.name as request_type_name,
  wol.workflow_id,
  rw.name as workflow_name,
  wol.step_id,
  ws.step_name,
  wol.request_data,
  wol.response_data,
  wol.error_message,
  wol.details
FROM 
  workflow_operation_logs wol
LEFT JOIN 
  profiles p ON wol.user_id = p.id
LEFT JOIN 
  request_types rt ON wol.request_type_id = rt.id
LEFT JOIN 
  request_workflows rw ON wol.workflow_id = rw.id
LEFT JOIN 
  workflow_steps ws ON wol.step_id = ws.id
ORDER BY 
  wol.created_at DESC;

-- دالة لتسجيل عمليات سير العمل
CREATE OR REPLACE FUNCTION log_workflow_operation(
  p_operation_type TEXT,
  p_request_type_id UUID DEFAULT NULL,
  p_workflow_id UUID DEFAULT NULL,
  p_step_id UUID DEFAULT NULL,
  p_request_data JSONB DEFAULT NULL,
  p_response_data JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_details TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO workflow_operation_logs(
    operation_type,
    user_id,
    request_type_id,
    workflow_id,
    step_id,
    request_data,
    response_data,
    error_message,
    details
  ) VALUES (
    p_operation_type,
    auth.uid(),
    p_request_type_id,
    p_workflow_id,
    p_step_id,
    p_request_data,
    p_response_data,
    p_error_message,
    p_details
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- تعليمات للمطورين:
-- يرجى ملاحظة أنه تم تغيير اسم الجدول من workflow_operation_logs إلى request_workflow_operation_logs
-- لضمان التوافق، نحن نحافظ على كلا الجدولين والعروض حاليًا
-- الرجاء استخدام request_workflow_operation_logs في الكود الجديد
-- الجدول الجديد والعرض موجودان في schema.sql الرئيسي

-- منظر بديل يدعم الجدول المستخدم في النظام - هذا للتوافق فقط
CREATE OR REPLACE VIEW request_workflow_operations_view AS
SELECT 
  wol.id,
  wol.operation_type,
  wol.created_at,
  p.display_name as user_name,
  p.email as user_email,
  wol.request_type_id,
  rt.name as request_type_name,
  wol.workflow_id,
  rw.name as workflow_name,
  wol.step_id,
  ws.step_name,
  wol.request_data,
  wol.response_data,
  wol.error_message,
  wol.details
FROM 
  request_workflow_operation_logs wol
LEFT JOIN 
  profiles p ON wol.user_id = p.id
LEFT JOIN 
  request_types rt ON wol.request_type_id = rt.id
LEFT JOIN 
  request_workflows rw ON wol.workflow_id = rw.id
LEFT JOIN 
  workflow_steps ws ON wol.step_id = ws.id
ORDER BY 
  wol.created_at DESC;

-- إضافة سياسات RLS لجداول سير العمل للسماح بالحذف للمسؤولين
-- 1. سياسات للجدول request_types
ALTER TABLE IF EXISTS public.request_types ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمسؤولين بحذف أنواع الطلبات بغض النظر عن حالة is_active
CREATE POLICY IF NOT EXISTS "Allow admins to delete request types"
ON public.request_types
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

-- 2. سياسات للجدول request_workflows
ALTER TABLE IF EXISTS public.request_workflows ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمسؤولين بحذف مسارات سير العمل بغض النظر عن حالة is_active
CREATE POLICY IF NOT EXISTS "Allow admins to delete workflows"
ON public.request_workflows
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

-- 3. سياسات للجدول workflow_steps
ALTER TABLE IF EXISTS public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمسؤولين بحذف خطوات سير العمل
CREATE POLICY IF NOT EXISTS "Allow admins to delete workflow steps"
ON public.workflow_steps
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

-- سياسات عامة لتمكين المسؤولين من قراءة وتعديل وإضافة لكل الجداول
-- للجدول request_types
CREATE POLICY IF NOT EXISTS "Allow admins to select request types"
ON public.request_types
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to insert request types"
ON public.request_types
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to update request types"
ON public.request_types
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

-- للجدول request_workflows
CREATE POLICY IF NOT EXISTS "Allow admins to select workflows"
ON public.request_workflows
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to insert workflows"
ON public.request_workflows
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to update workflows"
ON public.request_workflows
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

-- للجدول workflow_steps
CREATE POLICY IF NOT EXISTS "Allow admins to select workflow steps"
ON public.workflow_steps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to insert workflow steps"
ON public.workflow_steps
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to update workflow steps"
ON public.workflow_steps
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

-- سياسات للجدول request_workflow_operation_logs
ALTER TABLE IF EXISTS public.request_workflow_operation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow admins to select operation logs"
ON public.request_workflow_operation_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);

CREATE POLICY IF NOT EXISTS "Allow admins to update operation logs"
ON public.request_workflow_operation_logs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  )
);
