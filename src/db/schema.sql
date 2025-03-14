
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

  -- Begin transaction to delete request type (CASCADE takes care of dependents)
  BEGIN
    -- Nullify the log references to avoid foreign key constraint errors
    UPDATE request_workflow_operation_logs
    SET request_type_id = NULL
    WHERE request_type_id = p_request_type_id;
    
    -- Also update old-style logs (for compatibility)
    UPDATE workflow_operation_logs
    SET request_type_id = NULL
    WHERE request_type_id = p_request_type_id;
    
    -- Now simply delete the request type and let CASCADE handle the rest
    DELETE FROM request_types WHERE id = p_request_type_id;
    
    -- Log the deletion operation
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
            'deleted_at', now()
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
      'request_type_id', p_request_type_id
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


-- تحديث لدالة حذف الطلبات باستخدام خاصية الحذف المتتالي CASCADE
CREATE OR REPLACE FUNCTION public.delete_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_request jsonb;
  v_user_id uuid := auth.uid();
  v_has_permission boolean;
  v_error_message text;
BEGIN
  -- Get request data for logging
  SELECT jsonb_build_object(
    'id', id,
    'title', title,
    'request_type_id', request_type_id,
    'requester_id', requester_id,
    'workflow_id', workflow_id
  )
  INTO v_request
  FROM requests
  WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الطلب غير موجود'
    );
  END IF;
  
  -- Check if user is admin or the request creator
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) OR v_user_id = (v_request->>'requester_id')::uuid
  INTO v_has_permission;
  
  IF NOT v_has_permission THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف هذا الطلب'
    );
  END IF;
  
  -- Do the actual deletion (CASCADE handles the rest)
  BEGIN
    -- First nullify foreign key references in logs to avoid constraint errors
    UPDATE request_workflow_operation_logs
    SET request_id = NULL
    WHERE request_id = p_request_id;
    
    -- Update approval logs to avoid constraint errors
    UPDATE request_approval_logs
    SET request_id = NULL 
    WHERE request_id = p_request_id;
    
    -- Now delete the request (and rely on CASCADE for the rest)
    DELETE FROM requests WHERE id = p_request_id;
    
    -- Log the deletion
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'request_workflow_operation_logs'
    ) THEN
      INSERT INTO request_workflow_operation_logs(
        operation_type,
        user_id,
        request_data,
        details
      ) VALUES (
        'delete_request',
        v_user_id,
        v_request,
        'تم حذف الطلب بنجاح'
      );
    END IF;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'تم حذف الطلب بنجاح',
      'request_id', p_request_id
    );
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    
    -- Log the error
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
        'delete_request_error',
        v_user_id,
        v_request,
        v_error_message,
        'فشل حذف الطلب'
      );
    END IF;
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف الطلب: ' || v_error_message,
      'error_details', v_error_message
    );
  END;
END;
$function$;
