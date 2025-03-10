
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

-- IMPROVED: Function to insert workflow steps bypassing RLS
-- Fixed to handle multiple steps, error reporting, and properly clean existing steps
CREATE OR REPLACE FUNCTION public.insert_workflow_steps(steps jsonb[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  step jsonb;
  result jsonb;
  inserted_steps jsonb[] := '{}';
  step_result jsonb;
  v_error text;
  v_workflow_id uuid;
  v_workflow_ids uuid[] := '{}';
BEGIN
  -- Start transaction to ensure all steps are inserted or none
  BEGIN
    -- First collect all workflow IDs to delete existing steps
    FOR i IN 1..array_length(steps, 1) LOOP
      step := steps[i];
      v_workflow_id := (step->>'workflow_id')::uuid;
      
      -- Validate workflow ID exists
      IF v_workflow_id IS NULL THEN
        RAISE EXCEPTION 'Workflow ID is required for step %', i;
      END IF;
      
      -- Add to workflow IDs array if not already there
      IF NOT (v_workflow_id = ANY(v_workflow_ids)) THEN
        v_workflow_ids := array_append(v_workflow_ids, v_workflow_id);
      END IF;
    END LOOP;
    
    -- Delete existing steps for all collected workflow IDs
    IF array_length(v_workflow_ids, 1) > 0 THEN
      DELETE FROM workflow_steps 
      WHERE workflow_id = ANY(v_workflow_ids);
    END IF;
    
    -- Process each step
    FOR i IN 1..array_length(steps, 1) LOOP
      step := steps[i];
      v_workflow_id := (step->>'workflow_id')::uuid;
      
      -- Validate workflow exists
      IF NOT EXISTS (SELECT 1 FROM request_workflows WHERE id = v_workflow_id) THEN
        RAISE EXCEPTION 'Workflow with ID % does not exist', v_workflow_id;
      END IF;
      
      -- Insert the step and capture the result
      WITH inserted AS (
        INSERT INTO workflow_steps (
          workflow_id,
          step_order,
          step_name,
          step_type,
          approver_id,
          instructions,
          is_required,
          approver_type
        ) VALUES (
          v_workflow_id,
          (step->>'step_order')::int,
          step->>'step_name',
          COALESCE(step->>'step_type', 'decision'),
          (step->>'approver_id')::uuid,
          step->>'instructions',
          COALESCE((step->>'is_required')::boolean, true),
          COALESCE(step->>'approver_type', 'user')
        )
        RETURNING row_to_json(workflow_steps.*)::jsonb
      )
      SELECT i INTO step_result FROM inserted i;
      
      -- Add to our result array
      IF step_result IS NOT NULL THEN
        inserted_steps := array_append(inserted_steps, step_result);
      END IF;
    END LOOP;
    
    -- Create a result object
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully inserted ' || array_length(steps, 1)::text || ' workflow steps',
      'data', inserted_steps
    );
    
    RETURN result;
  
  EXCEPTION WHEN OTHERS THEN
    -- Get the error details
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    
    -- Create an error result
    result := jsonb_build_object(
      'success', false,
      'error', v_error,
      'message', 'Error inserting workflow steps: ' || v_error
    );
    
    RETURN result;
  END;
END;
$$;
