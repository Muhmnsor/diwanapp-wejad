
-- تحديث دالة حذف أنواع الطلبات للتعامل مع خطوات سير العمل والعلاقات بشكل صحيح
CREATE OR REPLACE FUNCTION public.delete_request_type(p_request_type_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_related_requests int;
  v_workflow_ids uuid[];
  v_default_workflow_id uuid;
BEGIN
  -- التحقق من صلاحيات المستخدم
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) INTO v_is_admin;
  
  -- السماح فقط للمشرفين بحذف أنواع الطلبات
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف أنواع الطلبات'
    );
  END IF;

  -- التحقق من وجود طلبات مرتبطة بهذا النوع
  SELECT COUNT(*)
  INTO v_related_requests
  FROM requests
  WHERE request_type_id = p_request_type_id;
  
  IF v_related_requests > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لا يمكن حذف نوع الطلب لأنه مرتبط بـ ' || v_related_requests || ' من الطلبات الموجودة'
    );
  END IF;

  -- الحصول على معرف سير العمل الافتراضي
  SELECT default_workflow_id INTO v_default_workflow_id
  FROM request_types
  WHERE id = p_request_type_id;

  -- الحصول على جميع معرفات سير العمل المرتبطة بنوع الطلب
  SELECT ARRAY_AGG(id)
  INTO v_workflow_ids
  FROM request_workflows
  WHERE request_type_id = p_request_type_id;

  -- تنفيذ عملية الحذف ضمن معاملة واحدة
  BEGIN
    -- 1. تصفير الإشارات في سجلات الموافقات إلى خطوات سير العمل
    IF v_workflow_ids IS NOT NULL AND array_length(v_workflow_ids, 1) > 0 THEN
      UPDATE request_approval_logs
      SET step_id = NULL
      WHERE step_id IN (
        SELECT id FROM workflow_steps WHERE workflow_id = ANY(v_workflow_ids)
      );
      
      -- تصفير الإشارات في سجلات العمليات
      UPDATE request_workflow_operation_logs
      SET step_id = NULL, workflow_id = NULL, request_type_id = NULL
      WHERE request_type_id = p_request_type_id 
         OR workflow_id = ANY(v_workflow_ids)
         OR step_id IN (
            SELECT id FROM workflow_steps WHERE workflow_id = ANY(v_workflow_ids)
         );
            
      -- 2. حذف خطوات سير العمل
      DELETE FROM workflow_steps
      WHERE workflow_id = ANY(v_workflow_ids);
    END IF;
      
    -- 3. حذف سير العمل نفسه
    DELETE FROM request_workflows
    WHERE request_type_id = p_request_type_id;
    
    -- 4. تحديث نوع الطلب لإزالة الإشارة إلى سير العمل الافتراضي
    UPDATE request_types
    SET default_workflow_id = NULL
    WHERE id = p_request_type_id;
      
    -- 5. أخيرًا، حذف نوع الطلب
    DELETE FROM request_types
    WHERE id = p_request_type_id;
    
    -- إعادة نتيجة نجاح العملية
    RETURN jsonb_build_object(
      'success', true,
      'message', 'تم حذف نوع الطلب وسير العمل المرتبط به بنجاح',
      'request_type_id', p_request_type_id,
      'workflows_deleted', v_workflow_ids
    );
  
  EXCEPTION WHEN OTHERS THEN
    -- إعادة رسالة خطأ مفصلة
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف نوع الطلب: ' || SQLERRM,
      'details', SQLERRM,
      'hint', 'تحقق من العلاقات مع الجداول الأخرى'
    );
  END;
END;
$function$;
