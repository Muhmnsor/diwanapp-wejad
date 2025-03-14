-- UPDATED FUNCTION: Insert request with special handling for developers
CREATE OR REPLACE FUNCTION public.insert_request_bypass_rls(request_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  new_request_id uuid;
  result jsonb;
  v_workflow_id uuid;
  v_current_step_id uuid;
  v_first_step_id uuid;
  v_approver_id uuid;
  v_approver_type text;
  v_user_id uuid;
  v_is_developer boolean;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user has developer role
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id
    AND r.name = 'developer'
  ) INTO v_is_developer;

  -- Extract workflow_id for potential step lookup
  v_workflow_id := (request_data->>'workflow_id')::uuid;
  v_current_step_id := (request_data->>'current_step_id')::uuid;
  
  -- If workflow exists but no current step is set, find the first step
  IF v_workflow_id IS NOT NULL AND v_current_step_id IS NULL THEN
    -- Get the first step from workflow_steps
    SELECT id, approver_id, approver_type 
    INTO v_first_step_id, v_approver_id, v_approver_type
    FROM workflow_steps
    WHERE workflow_id = v_workflow_id
    ORDER BY step_order ASC
    LIMIT 1;
    
    -- Use the first step as current_step_id if found
    IF v_first_step_id IS NOT NULL THEN
      v_current_step_id := v_first_step_id;
    END IF;
  END IF;
  
  -- Create the request with the determined current step
  -- IMPORTANT: For developers and normal users alike, we respect the requester_id if it's passed in
  -- otherwise we use the current user's ID
  INSERT INTO public.requests (
    requester_id,
    workflow_id,
    current_step_id,
    title,
    form_data,
    request_type_id,
    priority,
    status,
    due_date
  ) VALUES (
    COALESCE((request_data->>'requester_id')::uuid, v_user_id),
    v_workflow_id,
    v_current_step_id,
    request_data->>'title',
    (request_data->>'form_data')::jsonb,
    (request_data->>'request_type_id')::uuid,
    COALESCE(request_data->>'priority', 'medium'),
    COALESCE(request_data->>'status', 'pending'),
    CASE WHEN request_data->>'due_date' IS NOT NULL 
         THEN (request_data->>'due_date')::timestamp with time zone 
         ELSE NULL END
  )
  RETURNING id INTO new_request_id;
  
  -- Create approval record if we have a current step with an approver
  IF v_current_step_id IS NOT NULL AND v_approver_id IS NOT NULL THEN
    -- If approver type is role, create approval records for all users with that role
    IF v_approver_type = 'role' THEN
      INSERT INTO public.request_approvals (
        request_id, 
        step_id, 
        approver_id, 
        status
      )
      SELECT 
        new_request_id,
        v_current_step_id,
        user_id,
        'pending'
      FROM user_roles
      WHERE role_id = v_approver_id;
    ELSE
      -- Create single approval record for the direct approver
      INSERT INTO public.request_approvals (
        request_id,
        step_id,
        approver_id,
        status
      ) VALUES (
        new_request_id,
        v_current_step_id,
        v_approver_id,
        'pending'
      );
    END IF;
  END IF;
  
  -- Get the newly created record
  SELECT row_to_json(r)::jsonb INTO result
  FROM public.requests r
  WHERE r.id = new_request_id;
  
  -- Log operation for debugging
  BEGIN
    PERFORM log_workflow_operation(
      'create_request', 
      (request_data->>'request_type_id')::uuid, 
      v_workflow_id,
      v_current_step_id,
      request_data,
      result
    );
  EXCEPTION WHEN OTHERS THEN
    -- Just log to notice but don't fail the whole transaction
    RAISE NOTICE 'Failed to log workflow operation: %', SQLERRM;
  END;
  
  RETURN result;
END;
$$;

-- UPDATED FUNCTION: Get user incoming requests
CREATE OR REPLACE FUNCTION public.get_user_incoming_requests(p_user_id uuid)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_developer BOOLEAN;
BEGIN
  -- Check if user has developer role
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND r.name = 'developer'
  ) INTO v_is_developer;

  -- Developers see all pending requests, other users see only their assigned requests
  RETURN QUERY
  WITH opinion_steps AS (
    -- All opinion steps that the user hasn't responded to yet
    SELECT 
      r.id as request_id,
      r.current_step_id as step_id
    FROM 
      requests r
      JOIN workflow_steps ws ON r.current_step_id = ws.id
    WHERE 
      r.status = 'pending' AND
      ws.step_type = 'opinion' AND
      NOT EXISTS (
        SELECT 1 
        FROM request_approvals ra 
        WHERE ra.request_id = r.id AND 
              ra.step_id = r.current_step_id AND 
              ra.approver_id = p_user_id
      )
  ),
  decision_steps AS (
    -- Regular decision steps where user is the approver
    SELECT 
      r.id as request_id,
      r.current_step_id as step_id
    FROM 
      requests r
      JOIN workflow_steps ws ON r.current_step_id = ws.id
    WHERE 
      r.status = 'pending' AND
      (ws.step_type != 'opinion' OR ws.step_type IS NULL) AND
      (
        -- Direct approver check
        (ws.approver_id = p_user_id AND ws.approver_type = 'user')
        OR 
        -- Role-based approver check
        (ws.approver_type = 'role' AND EXISTS (
          SELECT 1 
          FROM user_roles ur 
          WHERE ur.user_id = p_user_id 
          AND ur.role_id = ws.approver_id
        ))
      )
  ),
  combined_steps AS (
    SELECT request_id, step_id FROM opinion_steps
    UNION
    SELECT request_id, step_id FROM decision_steps
    -- If developer, include all pending requests
    UNION
    SELECT r.id as request_id, r.current_step_id as step_id
    FROM requests r
    WHERE r.status = 'pending' AND v_is_developer = TRUE
  )
  SELECT 
    json_build_object(
      'id', r.id,
      'title', r.title,
      'form_data', r.form_data,
      'status', r.status,
      'priority', r.priority,
      'requester_id', r.requester_id,
      'request_type_id', r.request_type_id,
      'workflow_id', r.workflow_id,
      'current_step_id', r.current_step_id,
      'due_date', r.due_date,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'request_type', json_build_object(
        'id', rt.id,
        'name', rt.name,
        'description', rt.description
      ),
      'step_type', ws.step_type,
      'is_developer_view', v_is_developer AND NOT (
        -- Check if this is actually assigned to the user
        (ws.approver_id = p_user_id AND ws.approver_type = 'user') OR
        (ws.approver_type = 'role' AND EXISTS (
          SELECT 1 
          FROM user_roles ur 
          WHERE ur.user_id = p_user_id 
          AND ur.role_id = ws.approver_id
        ))
      )
    )
  FROM 
    requests r
    JOIN combined_steps cs ON r.id = cs.request_id
    JOIN workflow_steps ws ON r.current_step_id = ws.id
    LEFT JOIN request_types rt ON r.request_type_id = rt.id
  ORDER BY r.created_at DESC;
END;
$$;

-- NEW FUNCTION: Check specific permission for a user based on the granular permission system
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_app_name TEXT,
  p_permission_name TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_is_admin BOOLEAN := FALSE;
  v_has_direct_permission BOOLEAN := FALSE;
BEGIN
  -- First check if user is admin/app_admin (they have all permissions)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check for specific permissions via role_permissions
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND p.module = p_app_name
    AND p.name = p_permission_name
  ) INTO v_has_direct_permission;
  
  RETURN v_has_direct_permission;
END;
$$;

-- NEW FUNCTION: Get all permissions for a user (useful for client-side permission checks)
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  app TEXT,
  permission TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin/app_admin (they have all permissions)
  IF EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
  ) THEN
    -- Return all permissions for admins
    RETURN QUERY
    SELECT DISTINCT module, name
    FROM permissions;
  ELSE
    -- Return only permissions assigned to the user's roles
    RETURN QUERY
    SELECT DISTINCT p.module, p.name
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id;
  END IF;
END;
$$;

-- NEW ENHANCED FUNCTION: Get all requests with their related data for admin view
CREATE OR REPLACE FUNCTION public.get_all_requests_with_relations()
 RETURNS SETOF json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', r.id,
      'title', r.title,
      'form_data', r.form_data,
      'status', r.status,
      'priority', r.priority,
      'requester_id', r.requester_id,
      'request_type_id', r.request_type_id,
      'workflow_id', r.workflow_id,
      'current_step_id', r.current_step_id,
      'due_date', r.due_date,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'request_type', CASE 
        WHEN rt.id IS NOT NULL THEN
          json_build_object(
            'id', rt.id,
            'name', rt.name,
            'description', rt.description
          )
        ELSE NULL
      END,
      'workflow', CASE 
        WHEN rw.id IS NOT NULL THEN
          json_build_object(
            'id', rw.id,
            'name', rw.name,
            'description', rw.description
          )
        ELSE NULL
      END,
      'requester', CASE 
        WHEN p.id IS NOT NULL THEN
          json_build_object(
            'id', p.id,
            'display_name', p.display_name,
            'email', p.email
          )
        ELSE NULL
      END,
      'current_step', CASE 
        WHEN ws.id IS NOT NULL THEN
          json_build_object(
            'id', ws.id,
            'step_name', ws.step_name,
            'step_type', ws.step_type
          )
        ELSE NULL
      END
    )
  FROM 
    requests r
    LEFT JOIN request_types rt ON r.request_type_id = rt.id
    LEFT JOIN request_workflows rw ON r.workflow_id = rw.id
    LEFT JOIN profiles p ON r.requester_id = p.id
    LEFT JOIN workflow_steps ws ON r.current_step_id = ws.id
  ORDER BY r.created_at DESC;
END;
$function$;

-- UPDATED FUNCTION: Handle request deletion with proper cleanup of all related records
CREATE OR REPLACE FUNCTION public.delete_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_admin boolean;
  v_is_requester boolean;
  v_result jsonb;
  v_request_data jsonb;
  v_approvals_count int;
  v_attachments_count int;
  v_logs_count int;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) INTO v_is_admin;
  
  -- Check if user is the requester of this request
  SELECT EXISTS (
    SELECT 1 
    FROM requests
    WHERE id = p_request_id AND requester_id = auth.uid()
  ) INTO v_is_requester;
  
  -- Only allow admins or request creators to delete
  IF NOT (v_is_admin OR v_is_requester) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف هذا الطلب'
    );
  END IF;

  -- Get request data before deletion for logging
  SELECT json_build_object(
    'id', r.id,
    'title', r.title,
    'status', r.status,
    'requester_id', r.requester_id,
    'request_type_id', r.request_type_id,
    'created_at', r.created_at
  )::jsonb
  INTO v_request_data
  FROM requests r
  WHERE r.id = p_request_id;

  IF v_request_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الطلب غير موجود'
    );
  END IF;

  -- Begin transaction to delete request and related records
  BEGIN
    -- Count related records for reporting
    SELECT COUNT(*) INTO v_approvals_count FROM request_approvals WHERE request_id = p_request_id;
    SELECT COUNT(*) INTO v_attachments_count FROM request_attachments WHERE request_id = p_request_id;
    SELECT COUNT(*) INTO v_logs_count FROM request_approval_logs WHERE request_id = p_request_id;
    
    -- Delete in proper order: logs, then approvals, then attachments, then request
    -- First delete request_approval_logs (requires foreign key constraint fix)
    DELETE FROM request_approval_logs WHERE request_id = p_request_id;
    
    -- Delete approvals related to this request
    DELETE FROM request_approvals WHERE request_id = p_request_id;

    -- Delete attachments related to this request
    DELETE FROM request_attachments WHERE request_id = p_request_id;

    -- Finally delete the request
    DELETE FROM requests WHERE id = p_request_id;

    -- Log the deletion operation
    PERFORM log_workflow_operation(
      'delete_request',
      (v_request_data->>'request_type_id')::uuid,
      NULL,
      NULL,
      v_request_data,
      jsonb_build_object(
        'deleted_by', auth.uid(),
        'deleted_at', now(),
        'deleted_approvals', v_approvals_count,
        'deleted_attachments', v_attachments_count,
        'deleted_logs', v_logs_count
      )
    );

    v_result := jsonb_build_object(
      'success', true,
      'message', 'تم حذف الطلب بنجاح',
      'request_id', p_request_id,
      'deleted_approvals', v_approvals_count,
      'deleted_attachments', v_attachments_count,
      'deleted_logs', v_logs_count
    );

    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure message
    PERFORM log_workflow_operation(
      'delete_request_error',
      (v_request_data->>'request_type_id')::uuid,
      NULL,
      NULL,
      v_request_data,
      NULL,
      SQLERRM
    );

    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف الطلب: ' || SQLERRM
    );
  END;
END;
$function$;
