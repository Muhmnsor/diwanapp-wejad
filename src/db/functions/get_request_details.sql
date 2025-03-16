
-- Function to get detailed request information including user permissions
CREATE OR REPLACE FUNCTION public.get_request_details(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_requester_id uuid;
  v_current_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_is_in_workflow boolean;
  v_has_supervisor_access boolean;
  v_debug_info jsonb;
BEGIN
  -- Check if the user is an admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_current_user_id
    AND r.name IN ('admin', 'app_admin')
  ) INTO v_is_admin;

  -- Get the request base data, using aliases to avoid ambiguous column references
  WITH request_data AS (
    SELECT 
      r.id, 
      r.title, 
      r.status, 
      r.priority, 
      r.requester_id, 
      r.request_type_id, 
      r.workflow_id, 
      r.current_step_id, 
      r.created_at, 
      r.updated_at, 
      r.form_data,
      rt.name as request_type_name, 
      rt.description as request_type_description,
      rt.form_schema as request_type_form_schema
    FROM requests r
    JOIN request_types rt ON r.request_type_id = rt.id
    WHERE r.id = p_request_id
  )
  SELECT 
    jsonb_build_object(
      'request', jsonb_build_object(
        'id', rd.id,
        'title', rd.title,
        'status', rd.status,
        'priority', rd.priority,
        'requester_id', rd.requester_id,
        'request_type_id', rd.request_type_id,
        'workflow_id', rd.workflow_id,
        'current_step_id', rd.current_step_id,
        'created_at', rd.created_at,
        'updated_at', rd.updated_at,
        'form_data', rd.form_data
      ),
      'request_type', jsonb_build_object(
        'id', rd.request_type_id,
        'name', rd.request_type_name,
        'description', rd.request_type_description,
        'form_schema', rd.request_type_form_schema
      ),
      'workflow', (
        SELECT jsonb_build_object(
          'id', rw.id,
          'name', rw.name,
          'description', rw.description,
          'is_active', rw.is_active,
          'steps', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', ws.id,
                'step_name', ws.step_name,
                'step_type', ws.step_type,
                'approver_id', ws.approver_id,
                'approver_name', u.display_name,
                'is_required', ws.is_required,
                'step_order', ws.step_order,
                'instructions', ws.instructions
              ) ORDER BY ws.step_order
            )
            FROM workflow_steps ws
            LEFT JOIN users u ON ws.approver_id = u.id
            WHERE ws.workflow_id = rw.id),
            '[]'::jsonb
          )
        )
        FROM request_workflows rw
        WHERE rw.id = rd.workflow_id
      ),
      'current_step', (
        SELECT jsonb_build_object(
          'id', ws.id,
          'step_name', ws.step_name,
          'step_type', ws.step_type,
          'approver_id', ws.approver_id,
          'approver_name', u.display_name,
          'is_required', ws.is_required,
          'step_order', ws.step_order,
          'instructions', ws.instructions
        )
        FROM workflow_steps ws
        LEFT JOIN users u ON ws.approver_id = u.id
        WHERE ws.id = rd.current_step_id
      ),
      'approvals', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', ra.id,
            'step_id', ra.step_id,
            'step_name', ws.step_name,
            'step_type', ws.step_type,
            'approver_id', ra.approver_id,
            'approver_name', u.display_name,
            'status', ra.status,
            'comments', ra.comments,
            'created_at', ra.created_at,
            'updated_at', ra.updated_at
          ) ORDER BY ra.created_at DESC
        )
        FROM request_approvals ra
        LEFT JOIN workflow_steps ws ON ra.step_id = ws.id
        LEFT JOIN users u ON ra.approver_id = u.id
        WHERE ra.request_id = p_request_id),
        '[]'::jsonb
      ),
      'attachments', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', ra.id,
            'file_name', ra.file_name,
            'file_url', ra.file_url,
            'file_type', ra.file_type,
            'file_size', ra.file_size,
            'created_at', ra.created_at,
            'created_by', ra.created_by,
            'uploader_name', u.display_name
          ) ORDER BY ra.created_at DESC
        )
        FROM request_attachments ra
        LEFT JOIN users u ON ra.created_by = u.id
        WHERE ra.request_id = p_request_id),
        '[]'::jsonb
      ),
      'requester', (
        SELECT jsonb_build_object(
          'id', u.id,
          'display_name', u.display_name,
          'email', u.email
        )
        FROM users u
        WHERE u.id = rd.requester_id
      )
    ) INTO v_result
  FROM request_data rd;

  -- Extract requester_id for permission checks
  SELECT v_result->'request'->>'requester_id' INTO v_requester_id;
  
  -- Check if user is part of workflow (either current or future steps)
  SELECT EXISTS (
    SELECT 1 FROM workflow_steps ws
    WHERE ws.workflow_id = (v_result->'request'->>'workflow_id')::uuid
    AND ws.approver_id = v_current_user_id
  ) INTO v_is_in_workflow;
  
  -- Check if user has supervisor access (department head, supervisor, etc.)
  SELECT EXISTS (
    SELECT 1 
    FROM users_departments ud
    JOIN users_departments requester_ud ON requester_ud.user_id = v_requester_id
    WHERE ud.user_id = v_current_user_id
    AND ud.department_id = requester_ud.department_id
    AND ud.role IN ('head', 'supervisor', 'manager')
  ) INTO v_has_supervisor_access;
  
  -- Build permissions object
  v_result := jsonb_set(
    v_result,
    '{permissions}',
    jsonb_build_object(
      'is_requester', (v_requester_id = v_current_user_id),
      'is_admin', v_is_admin,
      'is_in_workflow', v_is_in_workflow,
      'has_supervisor_access', v_has_supervisor_access,
      'can_view', (
        v_requester_id = v_current_user_id OR 
        v_is_admin OR 
        v_is_in_workflow OR
        v_has_supervisor_access
      ),
      'can_view_workflow', (
        v_requester_id = v_current_user_id OR 
        v_is_admin OR 
        v_is_in_workflow OR
        v_has_supervisor_access
      )
    )
  );

  -- Create debug info for troubleshooting
  v_debug_info := jsonb_build_object(
    'current_user_id', v_current_user_id,
    'requester_id', v_requester_id,
    'is_requester', (v_requester_id = v_current_user_id),
    'is_admin', v_is_admin,
    'is_in_workflow', v_is_in_workflow,
    'has_supervisor_access', v_has_supervisor_access,
    'timestamp', now()
  );
  
  -- Add debug info to result
  v_result := jsonb_set(v_result, '{debug_info}', v_debug_info);

  -- Check if user has permission to view this request
  IF NOT (
    v_requester_id = v_current_user_id OR 
    v_is_admin OR 
    v_is_in_workflow OR
    v_has_supervisor_access
  ) THEN
    -- Log access denial
    INSERT INTO request_access_logs(
      request_id,
      user_id,
      action_type,
      status,
      metadata
    ) VALUES (
      p_request_id,
      v_current_user_id,
      'view_details',
      'denied',
      v_debug_info
    );
    
    RAISE EXCEPTION 'You do not have permission to view this request';
  END IF;

  -- Log successful access
  INSERT INTO request_access_logs(
    request_id,
    user_id,
    action_type,
    status,
    metadata
  ) VALUES (
    p_request_id,
    v_current_user_id,
    'view_details',
    'success',
    v_debug_info
  );

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  -- Better error messages with debug info
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'debug_info', v_debug_info
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_request_details(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_request_details(uuid) IS 'Get detailed information about a request including the workflow, current step, and permissions with improved access controls';
