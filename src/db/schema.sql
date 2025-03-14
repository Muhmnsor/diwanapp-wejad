
-- تحديث لعملية حذف أنواع الطلبات مع التعامل مع جميع العلاقات المرتبطة
-- Function to delete a request type and its related records
CREATE OR REPLACE FUNCTION public.delete_request_type(p_request_type_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_request_type_data jsonb;
  v_workflows jsonb[];
  v_workflow_ids uuid[];
  v_workflow_count int;
  v_step_ids uuid[];
  v_step_count int;
  v_related_requests int;
  v_error_message text;
BEGIN
  -- Check if user is admin or developer
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) INTO v_is_admin;
  
  -- Only allow admins to delete request types
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف أنواع الطلبات'
    );
  END IF;

  -- Check if there are any requests using this request type
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

  -- Get request type data before deletion for logging
  SELECT json_build_object(
    'id', rt.id,
    'name', rt.name,
    'description', rt.description,
    'is_active', rt.is_active
  )::jsonb
  INTO v_request_type_data
  FROM request_types rt
  WHERE rt.id = p_request_type_id;

  IF v_request_type_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'نوع الطلب غير موجود'
    );
  END IF;

  -- Get all workflow IDs for this request type
  SELECT array_agg(id)
  INTO v_workflow_ids
  FROM request_workflows
  WHERE request_type_id = p_request_type_id;

  -- Count workflows for logging
  SELECT COUNT(*)
  INTO v_workflow_count
  FROM request_workflows
  WHERE request_type_id = p_request_type_id;

  -- Get all step IDs for these workflows if workflows exist
  IF v_workflow_ids IS NOT NULL AND array_length(v_workflow_ids, 1) > 0 THEN
    SELECT array_agg(id)
    INTO v_step_ids
    FROM workflow_steps
    WHERE workflow_id = ANY(v_workflow_ids);
    
    -- Count steps for logging
    SELECT COUNT(*)
    INTO v_step_count
    FROM workflow_steps
    WHERE workflow_id = ANY(v_workflow_ids);
  ELSE
    v_step_count := 0;
  END IF;

  -- Begin transaction to delete request type and related records
  -- Using serializable isolation to prevent race conditions
  BEGIN
    -- Set transaction isolation level
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    
    -- Update logs to NULL references before deletion
    -- This prevents foreign key constraint violations
    
    -- 1. Update request_workflow_operation_logs for steps
    IF v_step_ids IS NOT NULL AND array_length(v_step_ids, 1) > 0 THEN
      UPDATE request_workflow_operation_logs
      SET step_id = NULL
      WHERE step_id = ANY(v_step_ids);
      
      -- Also update old-style logs (for compatibility)
      UPDATE workflow_operation_logs
      SET step_id = NULL
      WHERE step_id = ANY(v_step_ids);
    END IF;

    -- 2. Update request_approval_logs to set step_id to NULL where step will be deleted
    IF v_step_ids IS NOT NULL AND array_length(v_step_ids, 1) > 0 THEN
      UPDATE request_approval_logs
      SET step_id = NULL
      WHERE step_id = ANY(v_step_ids);
    END IF;

    -- 3. Update request_workflow_operation_logs for workflows
    IF v_workflow_ids IS NOT NULL AND array_length(v_workflow_ids, 1) > 0 THEN
      UPDATE request_workflow_operation_logs
      SET workflow_id = NULL
      WHERE workflow_id = ANY(v_workflow_ids);
      
      -- Also update old-style logs (for compatibility)
      UPDATE workflow_operation_logs
      SET workflow_id = NULL
      WHERE workflow_id = ANY(v_workflow_ids);
    END IF;
    
    -- 4. Update request_workflow_operation_logs for request type
    UPDATE request_workflow_operation_logs
    SET request_type_id = NULL
    WHERE request_type_id = p_request_type_id;
    
    -- Also update old-style logs (for compatibility)
    UPDATE workflow_operation_logs
    SET request_type_id = NULL
    WHERE request_type_id = p_request_type_id;

    -- 5. Delete workflow steps first (children)
    IF v_workflow_ids IS NOT NULL AND array_length(v_workflow_ids, 1) > 0 THEN
      DELETE FROM workflow_steps
      WHERE workflow_id = ANY(v_workflow_ids);
    END IF;
    
    -- 6. Delete workflows next (parent of steps, child of request type)
    IF v_workflow_ids IS NOT NULL AND array_length(v_workflow_ids, 1) > 0 THEN
      DELETE FROM request_workflows
      WHERE request_type_id = p_request_type_id;
    END IF;
    
    -- 7. Finally delete the request type (parent)
    DELETE FROM request_types WHERE id = p_request_type_id;

    -- 8. Log the deletion operation
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'request_workflow_operation_logs'
      ) THEN
        INSERT INTO request_workflow_operation_logs(
          operation_type,
          user_id,
          request_data,
          response_data,
          details
        ) VALUES (
          'delete_request_type',
          auth.uid(),
          v_request_type_data,
          jsonb_build_object(
            'deleted_by', auth.uid(),
            'deleted_at', now(),
            'workflow_count', v_workflow_count,
            'step_count', v_step_count
          ),
          'تم حذف نوع الطلب بنجاح'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If logging fails, just continue with the deletion
      RAISE NOTICE 'Failed to log workflow operation: %', SQLERRM;
    END;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'تم حذف نوع الطلب بنجاح',
      'request_type_id', p_request_type_id,
      'workflows_deleted', v_workflow_count,
      'steps_deleted', v_step_count
    );

    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure message
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'request_workflow_operation_logs'
      ) THEN
        INSERT INTO request_workflow_operation_logs(
          operation_type,
          user_id,
          request_data,
          error_message,
          details
        ) VALUES (
          'delete_request_type_error',
          auth.uid(),
          v_request_type_data,
          v_error_message,
          'فشل حذف نوع الطلب'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If logging fails, just continue with returning the error
      RAISE NOTICE 'Failed to log workflow error: %', SQLERRM;
    END;

    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف نوع الطلب: ' || v_error_message,
      'error_details', v_error_message
    );
  END;
END;
$function$;

