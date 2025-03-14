
-- Function to get enhanced data for PDF export
CREATE OR REPLACE FUNCTION public.get_request_pdf_export_data(p_request_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_request json;
  v_request_type json;
  v_approvals json;
  v_attachments json;
  v_result json;
  v_requester json;
BEGIN
  -- Get the request data
  SELECT 
    json_build_object(
      'id', r.id,
      'title', r.title,
      'form_data', r.form_data,
      'status', r.status,
      'priority', r.priority,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'requester_id', r.requester_id,
      'request_type_id', r.request_type_id,
      'workflow_id', r.workflow_id,
      'current_step_id', r.current_step_id
    )
  INTO v_request
  FROM requests r
  WHERE r.id = p_request_id;

  -- Get request type data
  SELECT 
    json_build_object(
      'id', rt.id,
      'name', rt.name,
      'description', rt.description
    )
  INTO v_request_type
  FROM request_types rt
  JOIN requests r ON r.request_type_id = rt.id
  WHERE r.id = p_request_id;
  
  -- Get requester data
  SELECT 
    json_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'email', p.email
    )
  INTO v_requester
  FROM profiles p
  JOIN requests r ON r.requester_id = p.id
  WHERE r.id = p_request_id;
  
  -- Get approvals data with step and approver info
  -- Using a subquery approach to avoid GROUP BY issues
  WITH approval_data AS (
    SELECT 
      ra.id,
      ra.status,
      ra.comments,
      ra.approved_at,
      ra.created_at,
      json_build_object(
        'id', ws.id,
        'step_name', ws.step_name,
        'step_type', ws.step_type,
        'approver_type', ws.approver_type
      ) AS step,
      json_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'email', p.email
      ) AS approver
    FROM request_approvals ra
    LEFT JOIN workflow_steps ws ON ra.step_id = ws.id
    LEFT JOIN profiles p ON ra.approver_id = p.id
    WHERE ra.request_id = p_request_id
  )
  SELECT json_agg(
    json_build_object(
      'id', ad.id,
      'status', ad.status,
      'comments', ad.comments,
      'approved_at', ad.approved_at,
      'created_at', ad.created_at,
      'step', ad.step,
      'approver', ad.approver
    ) ORDER BY ad.created_at ASC
  )
  INTO v_approvals
  FROM approval_data ad;
  
  -- Get attachments
  WITH attachment_data AS (
    SELECT 
      ra.id,
      ra.file_name,
      ra.file_path,
      ra.file_type,
      ra.file_size,
      ra.created_at,
      json_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'email', p.email
      ) AS uploaded_by
    FROM request_attachments ra
    LEFT JOIN profiles p ON ra.uploaded_by = p.id
    WHERE ra.request_id = p_request_id
  )
  SELECT json_agg(
    json_build_object(
      'id', ad.id,
      'file_name', ad.file_name,
      'file_path', ad.file_path,
      'file_type', ad.file_type,
      'file_size', ad.file_size,
      'created_at', ad.created_at,
      'uploaded_by', ad.uploaded_by
    ) ORDER BY ad.created_at DESC
  )
  INTO v_attachments
  FROM attachment_data ad;
  
  -- Build the final result object
  v_result := json_build_object(
    'request', v_request,
    'request_type', v_request_type,
    'requester', v_requester,
    'approvals', COALESCE(v_approvals, '[]'::json),
    'attachments', COALESCE(v_attachments, '[]'::json)
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error with details
    RAISE LOG 'Error in get_request_pdf_export_data: %', SQLERRM;
    RETURN json_build_object(
      'error', SQLERRM,
      'detail', 'An error occurred while preparing PDF export data'
    );
END;
$function$;

