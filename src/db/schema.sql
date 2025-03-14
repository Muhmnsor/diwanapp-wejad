
-- ... keep existing code

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
  v_workflow_steps jsonb[];
  v_step_ids uuid[];
  v_related_requests int;
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

  -- Begin transaction to delete request type and related records
  BEGIN
    -- 1. Update workflow_operation_logs to set workflow_id to NULL for any workflows we're going to delete
    IF v_workflow_ids IS NOT NULL AND array_length(v_workflow_ids, 1) > 0 THEN
      UPDATE workflow_operation_logs
      SET workflow_id = NULL
      WHERE workflow_id = ANY(v_workflow_ids);
      
      -- 2. Get all step IDs for these workflows
      SELECT array_agg(id)
      INTO v_step_ids
      FROM workflow_steps
      WHERE workflow_id = ANY(v_workflow_ids);
      
      -- 3. Update workflow_operation_logs to set step_id to NULL where step will be deleted
      IF v_step_ids IS NOT NULL AND array_length(v_step_ids, 1) > 0 THEN
        UPDATE workflow_operation_logs
        SET step_id = NULL
        WHERE step_id = ANY(v_step_ids);
        
        -- 4. Update request_approval_logs to set step_id to NULL where step will be deleted
        UPDATE request_approval_logs
        SET step_id = NULL
        WHERE step_id = ANY(v_step_ids);
      END IF;
      
      -- 5. Delete workflow steps
      DELETE FROM workflow_steps
      WHERE workflow_id = ANY(v_workflow_ids);
      
      -- 6. Delete workflows
      DELETE FROM request_workflows
      WHERE request_type_id = p_request_type_id;
    END IF;
    
    -- 7. Finally delete the request type
    DELETE FROM request_types WHERE id = p_request_type_id;

    -- 8. Log the deletion operation
    PERFORM log_workflow_operation(
      'delete_request_type',
      NULL,
      NULL,
      NULL,
      v_request_type_data,
      jsonb_build_object(
        'deleted_by', auth.uid(),
        'deleted_at', now(),
        'workflow_count', array_length(v_workflow_ids, 1),
        'step_count', array_length(v_step_ids, 1)
      )
    );

    v_result := jsonb_build_object(
      'success', true,
      'message', 'تم حذف نوع الطلب بنجاح',
      'request_type_id', p_request_type_id
    );

    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure message
    PERFORM log_workflow_operation(
      'delete_request_type_error',
      p_request_type_id,
      NULL,
      NULL,
      v_request_type_data,
      NULL,
      SQLERRM
    );

    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف نوع الطلب: ' || SQLERRM
    );
  END;
END;
$function$;

