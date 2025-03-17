
-- Fix the get_request_details function to properly include approver_id
CREATE OR REPLACE FUNCTION public.get_request_details(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
  v_user_id UUID := auth.uid();
  v_is_admin BOOLEAN;
  v_is_approver BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT public.is_admin() INTO v_is_admin;
  
  -- Check if current user is an approver for the current step
  SELECT public.is_approver_for_request(p_request_id) INTO v_is_approver;
  
  -- User must be request owner, admin, or approver
  IF NOT (v_is_admin OR v_is_approver OR EXISTS (SELECT 1 FROM requests WHERE id = p_request_id AND requester_id = v_user_id)) THEN
    RAISE EXCEPTION 'Not authorized to view this request';
  END IF;

  -- Get request details with related data
  WITH request_data AS (
    SELECT 
      r.id,
      r.title,
      r.form_data,
      r.status,
      r.priority,
      r.due_date,
      r.created_at,
      r.updated_at,
      r.requester_id,
      r.workflow_id,
      r.current_step_id,
      r.request_type_id,
      rt.name AS request_type_name,
      rt.description AS request_type_description,
      rt.form_schema,
      rw.name AS workflow_name,
      rw.description AS workflow_description,
      ws.step_name AS current_step_name,
      ws.step_type AS step_type,
      ws.instructions AS current_step_instructions,
      ws.approver_id, -- Added: Include the approver_id
      p.display_name AS requester_name,
      p.email AS requester_email,
      pa.display_name AS approver_name,
      pa.email AS approver_email
    FROM
      requests r
      LEFT JOIN request_types rt ON r.request_type_id = rt.id
      LEFT JOIN request_workflows rw ON r.workflow_id = rw.id
      LEFT JOIN workflow_steps ws ON r.current_step_id = ws.id
      LEFT JOIN profiles p ON r.requester_id = p.id
      LEFT JOIN profiles pa ON ws.approver_id = pa.id
    WHERE
      r.id = p_request_id
  ),
  approvals_data AS (
    SELECT
      ra.request_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ra.id,
          'status', ra.status,
          'comments', ra.comments,
          'approved_at', ra.approved_at,
          'created_at', ra.created_at,
          'approver', jsonb_build_object(
            'id', p.id,
            'display_name', p.display_name,
            'email', p.email
          ),
          'step', jsonb_build_object(
            'id', ws.id,
            'step_name', ws.step_name,
            'step_order', ws.step_order,
            'step_type', ws.step_type
          )
        )
      ) AS approvals
    FROM
      request_approvals ra
      LEFT JOIN profiles p ON ra.approver_id = p.id
      LEFT JOIN workflow_steps ws ON ra.step_id = ws.id
    WHERE
      ra.request_id = p_request_id
    GROUP BY
      ra.request_id
  ),
  attachments_data AS (
    SELECT
      att.request_id,
      jsonb_agg(
        jsonb_build_object(
          'id', att.id,
          'file_name', att.file_name,
          'file_path', att.file_path,
          'file_type', att.file_type,
          'file_size', att.file_size,
          'created_at', att.created_at,
          'uploader', jsonb_build_object(
            'id', p.id,
            'display_name', p.display_name,
            'email', p.email
          )
        )
      ) AS attachments
    FROM
      request_attachments att
      LEFT JOIN profiles p ON att.uploaded_by = p.id
    WHERE
      att.request_id = p_request_id
    GROUP BY
      att.request_id
  )
  
  SELECT
    jsonb_build_object(
      'request', row_to_json(rd)::jsonb,
      'request_type', jsonb_build_object(
        'id', rd.request_type_id,
        'name', rd.request_type_name,
        'description', rd.request_type_description,
        'form_schema', rd.form_schema
      ),
      'workflow', jsonb_build_object(
        'id', rd.workflow_id,
        'name', rd.workflow_name,
        'description', rd.workflow_description
      ),
      'current_step', jsonb_build_object(
        'id', rd.current_step_id,
        'step_name', rd.current_step_name,
        'step_type', rd.step_type,
        'instructions', rd.current_step_instructions,
        'approver', CASE 
          WHEN rd.approver_id IS NOT NULL THEN
            jsonb_build_object(
              'id', rd.approver_id,
              'display_name', rd.approver_name,
              'email', rd.approver_email
            )
          ELSE NULL
        END
      ),
      'requester', jsonb_build_object(
        'id', rd.requester_id,
        'display_name', rd.requester_name,
        'email', rd.requester_email
      ),
      'approvals', COALESCE((SELECT ad.approvals FROM approvals_data ad WHERE ad.request_id = p_request_id), '[]'::jsonb),
      'attachments', COALESCE((SELECT attd.attachments FROM attachments_data attd WHERE attd.request_id = p_request_id), '[]'::jsonb)
    )
  INTO result
  FROM
    request_data rd;

  RETURN result;
END;
$function$;
