
-- Update the function to better handle multiple approvers and role-based approvals
CREATE OR REPLACE FUNCTION public.get_user_incoming_requests(p_user_id uuid)
 RETURNS SETOF json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH current_steps AS (
    -- Get step info for all requests that are pending or in progress and have an approver
    SELECT 
      r.id as request_id,
      r.current_step_id as step_id,
      ws.step_name,
      ws.step_order as current_step_order,
      ws.step_type as step_type,
      ws.approver_id,
      ws.approver_type,
      r.workflow_id,
      r.status
    FROM 
      requests r
      JOIN workflow_steps ws ON r.current_step_id = ws.id
    WHERE 
      r.status IN ('pending', 'in_progress')
  ),
  user_role_ids AS (
    -- Get all role IDs that the user has
    SELECT role_id
    FROM user_roles
    WHERE user_id = p_user_id
  ),
  eligible_steps AS (
    -- Steps that this user can act on
    SELECT 
      cs.request_id,
      cs.step_id,
      cs.step_type
    FROM 
      current_steps cs
    WHERE 
      -- Direct approver match
      (cs.approver_id = p_user_id AND cs.approver_type = 'user')
      OR
      -- Role-based approver match
      (cs.approver_type = 'role' AND cs.approver_id IN (SELECT role_id FROM user_role_ids))
      OR
      -- For opinion steps, anyone can participate
      (cs.step_type = 'opinion')
      OR
      -- Developer override - developers can see all steps
      EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.name IN ('developer', 'admin', 'app_admin')
      )
  ),
  already_approved AS (
    -- Check steps the user has already acted on
    SELECT 
      ra.request_id,
      ra.step_id
    FROM 
      request_approvals ra
    WHERE 
      ra.approver_id = p_user_id
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
      'has_submitted_opinion', EXISTS (
        SELECT 1 FROM already_approved aa 
        WHERE aa.request_id = r.id AND aa.step_id = r.current_step_id
      )
    )
  FROM 
    requests r
    JOIN eligible_steps es ON r.id = es.request_id
    JOIN workflow_steps ws ON r.current_step_id = ws.id
    LEFT JOIN request_types rt ON r.request_type_id = rt.id
  WHERE
    -- Don't show steps the user has already acted on
    NOT EXISTS (
      SELECT 1 
      FROM already_approved aa 
      WHERE aa.request_id = r.id AND aa.step_id = r.current_step_id
    )
    -- Don't show requests created by the user unless it's an opinion step or they're an admin
    AND (
      r.requester_id != p_user_id
      OR 
      ws.step_type = 'opinion'
      OR
      EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.name IN ('developer', 'admin', 'app_admin')
      )
    )
  ORDER BY r.created_at DESC;
END;
$function$;

-- Also add a new function to diagnose workflow issues
CREATE OR REPLACE FUNCTION public.get_user_role_ids(p_user_id uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_ids uuid[];
BEGIN
  SELECT array_agg(role_id)
  INTO v_role_ids
  FROM user_roles
  WHERE user_id = p_user_id;
  
  RETURN v_role_ids;
END;
$function$;
