
-- UPDATED FUNCTION: Update request after rejection
CREATE OR REPLACE FUNCTION public.update_request_after_rejection(p_request_id uuid, p_step_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE requests
  SET 
    status = 'rejected',
    updated_at = now()
  WHERE 
    id = p_request_id;
      
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم رفض الطلب بنجاح'
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'حدث خطأ أثناء تحديث حالة الطلب: ' || SQLERRM
  );
END;
$$;

-- UPDATED FUNCTION: Get user incoming requests
CREATE OR REPLACE FUNCTION public.get_user_incoming_requests(p_user_id uuid)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
      'step_type', ws.step_type
    )
  FROM 
    requests r
    JOIN combined_steps cs ON r.id = cs.request_id
    JOIN workflow_steps ws ON r.current_step_id = ws.id
    LEFT JOIN request_types rt ON r.request_type_id = rt.id
  ORDER BY r.created_at DESC;
END;
$$;
