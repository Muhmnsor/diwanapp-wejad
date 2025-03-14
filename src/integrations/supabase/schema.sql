
-- Fix foreign key constraints for request_workflow_operation_logs

-- First, handle any orphaned records by setting their step_id to NULL
UPDATE request_workflow_operation_logs
SET step_id = NULL
WHERE step_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM workflow_steps WHERE id = request_workflow_operation_logs.step_id
);

-- Do the same for the older workflow_operation_logs table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workflow_operation_logs'
  ) THEN
    UPDATE workflow_operation_logs
    SET step_id = NULL
    WHERE step_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM workflow_steps WHERE id = workflow_operation_logs.step_id
    );
  END IF;
END
$$;

-- Also handle orphaned records in request_approval_logs
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'request_approval_logs'
  ) THEN
    UPDATE request_approval_logs
    SET step_id = NULL
    WHERE step_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM workflow_steps WHERE id = request_approval_logs.step_id
    );
  END IF;
END
$$;

-- Modify the foreign key constraints to SET NULL on delete for request_workflow_operation_logs
DO $$
BEGIN
  -- Drop existing constraints if they exist
  IF EXISTS (
    SELECT FROM pg_constraint 
    WHERE conname = 'workflow_operation_logs_request_type_id_fkey'
    AND conrelid = 'request_workflow_operation_logs'::regclass
  ) THEN
    ALTER TABLE request_workflow_operation_logs 
    DROP CONSTRAINT workflow_operation_logs_request_type_id_fkey;
    
    -- Re-add with ON DELETE SET NULL
    ALTER TABLE request_workflow_operation_logs 
    ADD CONSTRAINT workflow_operation_logs_request_type_id_fkey 
    FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT FROM pg_constraint 
    WHERE conname = 'workflow_operation_logs_workflow_id_fkey'
    AND conrelid = 'request_workflow_operation_logs'::regclass
  ) THEN
    ALTER TABLE request_workflow_operation_logs 
    DROP CONSTRAINT workflow_operation_logs_workflow_id_fkey;
    
    -- Re-add with ON DELETE SET NULL
    ALTER TABLE request_workflow_operation_logs 
    ADD CONSTRAINT workflow_operation_logs_workflow_id_fkey 
    FOREIGN KEY (workflow_id) REFERENCES request_workflows(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT FROM pg_constraint 
    WHERE conname = 'workflow_operation_logs_step_id_fkey'
    AND conrelid = 'request_workflow_operation_logs'::regclass
  ) THEN
    ALTER TABLE request_workflow_operation_logs 
    DROP CONSTRAINT workflow_operation_logs_step_id_fkey;
    
    -- Re-add with ON DELETE SET NULL
    ALTER TABLE request_workflow_operation_logs 
    ADD CONSTRAINT workflow_operation_logs_step_id_fkey 
    FOREIGN KEY (step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Handle the old workflow_operation_logs table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workflow_operation_logs'
  ) THEN
    -- Drop and recreate constraints for the old table
    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'workflow_operation_logs_request_type_id_fkey'
      AND conrelid = 'workflow_operation_logs'::regclass
    ) THEN
      ALTER TABLE workflow_operation_logs 
      DROP CONSTRAINT workflow_operation_logs_request_type_id_fkey;
      
      ALTER TABLE workflow_operation_logs 
      ADD CONSTRAINT workflow_operation_logs_request_type_id_fkey 
      FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'workflow_operation_logs_workflow_id_fkey'
      AND conrelid = 'workflow_operation_logs'::regclass
    ) THEN
      ALTER TABLE workflow_operation_logs 
      DROP CONSTRAINT workflow_operation_logs_workflow_id_fkey;
      
      ALTER TABLE workflow_operation_logs 
      ADD CONSTRAINT workflow_operation_logs_workflow_id_fkey 
      FOREIGN KEY (workflow_id) REFERENCES request_workflows(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'workflow_operation_logs_step_id_fkey'
      AND conrelid = 'workflow_operation_logs'::regclass
    ) THEN
      ALTER TABLE workflow_operation_logs 
      DROP CONSTRAINT workflow_operation_logs_step_id_fkey;
      
      ALTER TABLE workflow_operation_logs 
      ADD CONSTRAINT workflow_operation_logs_step_id_fkey 
      FOREIGN KEY (step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

-- Handle the request_approval_logs table
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'request_approval_logs'
  ) THEN
    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'request_approval_logs_step_id_fkey'
    ) THEN
      ALTER TABLE request_approval_logs 
      DROP CONSTRAINT request_approval_logs_step_id_fkey;
      
      ALTER TABLE request_approval_logs 
      ADD CONSTRAINT request_approval_logs_step_id_fkey 
      FOREIGN KEY (step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

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

-- تبسيط دالة حذف الطلبات
CREATE OR REPLACE FUNCTION public.delete_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_has_permission boolean;
BEGIN
  -- التحقق من وجود الطلب
  IF NOT EXISTS (SELECT 1 FROM requests WHERE id = p_request_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الطلب غير موجود'
    );
  END IF;
  
  -- التحقق إذا كان المستخدم مشرف أو منشئ الطلب
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) OR v_user_id = (SELECT requester_id FROM requests WHERE id = p_request_id)
  INTO v_has_permission;
  
  IF NOT v_has_permission THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف هذا الطلب'
    );
  END IF;
  
  -- حذف الطلب مباشرةً والاعتماد على CASCADE
  BEGIN
    -- إزالة المرجع إلى الخطوة لتجنب أخطاء العلاقات
    UPDATE requests
    SET current_step_id = NULL
    WHERE id = p_request_id;
    
    -- حذف الطلب
    DELETE FROM requests WHERE id = p_request_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'تم حذف الطلب بنجاح',
      'request_id', p_request_id
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف الطلب: ' || SQLERRM
    );
  END;
END;
$function$;
