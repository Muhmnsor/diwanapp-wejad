
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
  SELECT json_agg(
    json_build_object(
      'id', ra.id,
      'status', ra.status,
      'comments', ra.comments,
      'approved_at', ra.approved_at,
      'created_at', ra.created_at,
      'step', json_build_object(
        'id', ws.id,
        'step_name', ws.step_name,
        'step_type', ws.step_type,
        'approver_type', ws.approver_type
      ),
      'approver', json_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'email', p.email
      )
    )
  )
  INTO v_approvals
  FROM request_approvals ra
  LEFT JOIN workflow_steps ws ON ra.step_id = ws.id
  LEFT JOIN profiles p ON ra.approver_id = p.id
  WHERE ra.request_id = p_request_id
  ORDER BY ra.created_at ASC;
  
  -- Get attachments
  SELECT json_agg(
    json_build_object(
      'id', ra.id,
      'file_name', ra.file_name,
      'file_path', ra.file_path,
      'file_type', ra.file_type,
      'file_size', ra.file_size,
      'created_at', ra.created_at,
      'uploaded_by', json_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'email', p.email
      )
    )
  )
  INTO v_attachments
  FROM request_attachments ra
  LEFT JOIN profiles p ON ra.uploaded_by = p.id
  WHERE ra.request_id = p_request_id;
  
  -- Build the final result object
  v_result := json_build_object(
    'request', v_request,
    'request_type', v_request_type,
    'requester', v_requester,
    'approvals', COALESCE(v_approvals, '[]'::json),
    'attachments', COALESCE(v_attachments, '[]'::json)
  );
  
  RETURN v_result;
END;
$function$;

-- Add function for creating a PDF export record (for tracking purposes)
CREATE OR REPLACE FUNCTION public.record_request_pdf_export(
  p_request_id UUID,
  p_exported_by UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_export_id UUID;
  v_result json;
BEGIN
  -- Create a record of the export
  INSERT INTO request_export_logs (
    request_id,
    exported_by,
    export_type
  ) VALUES (
    p_request_id,
    p_exported_by,
    'pdf'
  ) RETURNING id INTO v_export_id;
  
  -- Return result
  v_result := json_build_object(
    'id', v_export_id,
    'request_id', p_request_id,
    'exported_by', p_exported_by,
    'export_type', 'pdf'
  );
  
  RETURN v_result;
END;
$function$;

-- Create a table to track PDF exports
CREATE TABLE IF NOT EXISTS public.request_export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.requests(id) NOT NULL,
  exported_by UUID REFERENCES auth.users(id) NOT NULL,
  export_type TEXT NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set RLS policies for the export logs table
ALTER TABLE public.request_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports" 
  ON public.request_export_logs 
  FOR SELECT 
  USING (auth.uid() = exported_by);

CREATE POLICY "Users can create export records" 
  ON public.request_export_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = exported_by);
