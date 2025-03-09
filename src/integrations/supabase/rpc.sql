
-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'app_admin')
  );
END;
$$;

-- Function to check if the current user is an approver for a specific step
CREATE OR REPLACE FUNCTION public.is_step_approver(p_step_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM workflow_steps ws
    WHERE ws.id = p_step_id
    AND (
      ws.approver_id = auth.uid() OR
      (ws.approver_type = 'role' AND EXISTS (
        SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role_id = ws.approver_id
      ))
    )
  );
END;
$$;

-- Function to insert a request bypassing RLS
CREATE OR REPLACE FUNCTION public.insert_request_bypass_rls(request_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_request_id uuid;
  result jsonb;
BEGIN
  -- Create the request
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
    (request_data->>'requester_id')::uuid,
    (request_data->>'workflow_id')::uuid,
    (request_data->>'current_step_id')::uuid,
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
  
  -- Get the newly created record
  SELECT row_to_json(r)::jsonb INTO result
  FROM public.requests r
  WHERE r.id = new_request_id;
  
  RETURN result;
END;
$$;

-- Function to get user's outgoing requests safely
CREATE OR REPLACE FUNCTION public.get_user_outgoing_requests(p_user_id UUID)
RETURNS SETOF requests
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT r.*
  FROM requests r
  WHERE r.requester_id = p_user_id
  ORDER BY r.created_at DESC;
END;
$$;
