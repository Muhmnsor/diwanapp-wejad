
-- UPDATED FUNCTION: Insert workflow steps bypassing RLS with improved UUID validation and error handling
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
  v_step_count int := 0;
  v_is_valid_uuid boolean;
BEGIN
  -- Start transaction to ensure all steps are inserted or none
  BEGIN
    -- Safety check: Ensure steps array is not null or empty
    IF steps IS NULL OR array_length(steps, 1) IS NULL THEN
      RAISE EXCEPTION 'No workflow steps provided';
    END IF;
    
    v_step_count := array_length(steps, 1);
    RAISE NOTICE 'Processing % workflow steps', v_step_count;
    
    -- First collect all workflow IDs to delete existing steps
    FOR i IN 1..v_step_count LOOP
      step := steps[i];
      
      -- Log the raw step data for debugging
      RAISE NOTICE 'Step % raw data: %', i, step;
      
      -- Validate workflow ID exists in each step
      IF step->>'workflow_id' IS NULL OR (step->>'workflow_id') = '' THEN
        RAISE EXCEPTION 'Workflow ID is required for step %', i;
      END IF;
      
      -- Check if workflow_id is a valid UUID
      BEGIN
        v_workflow_id := (step->>'workflow_id')::uuid;
        v_is_valid_uuid := true;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Invalid UUID format for workflow_id in step %: %', i, step->>'workflow_id';
        v_is_valid_uuid := false;
      END;
      
      IF NOT v_is_valid_uuid THEN
        RAISE EXCEPTION 'Invalid UUID format for workflow_id in step %: %', i, step->>'workflow_id';
      END IF;
      
      RAISE NOTICE 'Step % has workflow_id: %', i, v_workflow_id;
      
      -- Add to workflow IDs array if not already there
      IF NOT (v_workflow_id = ANY(v_workflow_ids)) THEN
        v_workflow_ids := array_append(v_workflow_ids, v_workflow_id);
        RAISE NOTICE 'Added workflow_id % to delete list', v_workflow_id;
      END IF;
    END LOOP;
    
    -- Delete existing steps for all collected workflow IDs
    IF array_length(v_workflow_ids, 1) > 0 THEN
      RAISE NOTICE 'Deleting existing steps for % workflows: %', array_length(v_workflow_ids, 1), v_workflow_ids;
      DELETE FROM workflow_steps 
      WHERE workflow_id = ANY(v_workflow_ids);
    END IF;
    
    -- Process each step
    FOR i IN 1..v_step_count LOOP
      step := steps[i];
      
      -- Ensure workflow_id is a valid UUID before casting
      BEGIN
        v_workflow_id := (step->>'workflow_id')::uuid;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid UUID format for workflow_id in step %: %', i, step->>'workflow_id';
      END;
      
      -- Validate workflow exists
      IF NOT EXISTS (SELECT 1 FROM request_workflows WHERE id = v_workflow_id) THEN
        RAISE EXCEPTION 'Workflow with ID % does not exist', v_workflow_id;
      END IF;
      
      -- Validate other required fields
      IF step->>'step_name' IS NULL OR (step->>'step_name') = '' THEN
        RAISE EXCEPTION 'Step name is required for step %', i;
      END IF;
      
      IF step->>'approver_id' IS NULL OR (step->>'approver_id') = '' THEN
        RAISE EXCEPTION 'Approver ID is required for step %', i;
      END IF;
      
      -- Validate approver_id is a valid UUID
      DECLARE
        v_approver_id uuid;
        v_is_valid_approver_uuid boolean;
      BEGIN
        BEGIN
          v_approver_id := (step->>'approver_id')::uuid;
          v_is_valid_approver_uuid := true;
        EXCEPTION WHEN others THEN
          RAISE NOTICE 'Invalid UUID format for approver_id in step %: %', i, step->>'approver_id';
          v_is_valid_approver_uuid := false;
        END;
        
        IF NOT v_is_valid_approver_uuid THEN
          RAISE EXCEPTION 'Invalid UUID format for approver_id in step %: %', i, step->>'approver_id';
        END IF;
      END;
      
      -- Insert the step and capture the result
      RAISE NOTICE 'Inserting step % for workflow %', i, v_workflow_id;
      
      BEGIN
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
            COALESCE((step->>'step_order')::int, i),
            step->>'step_name',
            COALESCE(step->>'step_type', 'decision'),
            (step->>'approver_id')::uuid,
            step->>'instructions',
            COALESCE((step->>'is_required')::boolean, true),
            COALESCE(step->>'approver_type', 'user')
          )
          RETURNING row_to_json(workflow_steps.*)::jsonb AS step_data
        )
        SELECT step_data INTO step_result FROM inserted;
      EXCEPTION WHEN others THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        RAISE EXCEPTION 'Error inserting step %: %', i, v_error;
      END;
      
      -- Add to our result array
      IF step_result IS NOT NULL THEN
        inserted_steps := array_append(inserted_steps, step_result);
        RAISE NOTICE 'Successfully inserted step %', i;
      ELSE
        RAISE EXCEPTION 'Failed to insert step %', i;
      END IF;
    END LOOP;
    
    -- Create a result object
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully inserted ' || v_step_count::text || ' workflow steps',
      'data', inserted_steps
    );
    
    RETURN result;
  
  EXCEPTION WHEN OTHERS THEN
    -- Get the error details
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE NOTICE 'Error in insert_workflow_steps: %', v_error;
    
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
