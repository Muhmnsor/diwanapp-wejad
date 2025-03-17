
-- Update is_approver_for_request function to fix the ambiguous column reference
CREATE OR REPLACE FUNCTION public.is_approver_for_request(p_request_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_current_step_id uuid;
  v_approver_type text;
  v_approver_id uuid;
BEGIN
  -- Get the current step for this request
  SELECT 
    r.current_step_id,
    ws.approver_type,
    ws.approver_id
  INTO 
    v_current_step_id,
    v_approver_type,
    v_approver_id
  FROM 
    requests r
    LEFT JOIN workflow_steps ws ON r.current_step_id = ws.id
  WHERE 
    r.id = p_request_id;
  
  -- If no current step, user is not an approver
  IF v_current_step_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is direct approver or has appropriate role
  RETURN (
    (v_approver_id = auth.uid() AND v_approver_type = 'user') OR
    (v_approver_type = 'role' AND EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role_id = v_approver_id
    ))
  );
END;
$function$;
