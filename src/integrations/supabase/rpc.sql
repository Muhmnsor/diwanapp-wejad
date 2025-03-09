
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
