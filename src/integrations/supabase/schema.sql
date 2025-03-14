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
