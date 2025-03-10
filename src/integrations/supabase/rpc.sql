
-- UPDATED FUNCTION: Insert workflow steps bypassing RLS with improved UUID validation, explicit column referencing, and more robust error handling
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
  v_step_id uuid;
  v_loop_index int;
  v_step_order int;
  v_step_name text;
  v_step_type text;
  v_approver_id uuid;
  v_approver_type text;
  v_instructions text;
  v_is_required boolean;
  v_created_at timestamptz;
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
    FOR v_loop_index IN 1..v_step_count LOOP
      step := steps[v_loop_index];
      
      -- Log the raw step data for debugging
      RAISE NOTICE 'Step % raw data: %', v_loop_index, step;
      
      -- Validate workflow ID exists in each step
      IF step->>'workflow_id' IS NULL OR (step->>'workflow_id') = '' THEN
        RAISE EXCEPTION 'Workflow ID is required for step %', v_loop_index;
      END IF;
      
      -- Check if workflow_id is a valid UUID
      BEGIN
        v_workflow_id := (step->>'workflow_id')::uuid;
        v_is_valid_uuid := true;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Invalid UUID format for workflow_id in step %: %', v_loop_index, step->>'workflow_id';
        v_is_valid_uuid := false;
      END;
      
      IF NOT v_is_valid_uuid THEN
        RAISE EXCEPTION 'Invalid UUID format for workflow_id in step %: %', v_loop_index, step->>'workflow_id';
      END IF;
      
      RAISE NOTICE 'Step % has workflow_id: %', v_loop_index, v_workflow_id;
      
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
    
    -- Process each step - FIXED: Using variables to avoid ambiguous column references
    FOR v_loop_index IN 1..v_step_count LOOP
      step := steps[v_loop_index];
      
      -- Extract all values into variables first to avoid ambiguity
      BEGIN
        v_workflow_id := (step->>'workflow_id')::uuid;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid UUID format for workflow_id in step %: %', v_loop_index, step->>'workflow_id';
      END;
      
      -- Validate workflow exists
      IF NOT EXISTS (SELECT 1 FROM request_workflows WHERE id = v_workflow_id) THEN
        RAISE EXCEPTION 'Workflow with ID % does not exist', v_workflow_id;
      END IF;
      
      -- Validate and extract step_name
      IF step->>'step_name' IS NULL OR (step->>'step_name') = '' THEN
        RAISE EXCEPTION 'Step name is required for step %', v_loop_index;
      END IF;
      v_step_name := step->>'step_name';
      
      -- Validate and extract approver_id
      IF step->>'approver_id' IS NULL OR (step->>'approver_id') = '' THEN
        RAISE EXCEPTION 'Approver ID is required for step %', v_loop_index;
      END IF;
      
      -- Validate approver_id is a valid UUID
      BEGIN
        v_approver_id := (step->>'approver_id')::uuid;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid UUID format for approver_id in step %: %', v_loop_index, step->>'approver_id';
      END;
      
      -- Extract other fields with default values if missing
      v_step_order := COALESCE((step->>'step_order')::integer, v_loop_index);
      v_step_type := COALESCE(step->>'step_type', 'decision');
      v_approver_type := COALESCE(step->>'approver_type', 'user');
      v_instructions := step->>'instructions';
      v_is_required := COALESCE((step->>'is_required')::boolean, true);
      
      -- Check if step ID is provided and valid
      IF step->>'id' IS NOT NULL AND (step->>'id') != '' AND (step->>'id') != 'null' THEN
        BEGIN
          v_step_id := (step->>'id')::uuid;
        EXCEPTION WHEN others THEN
          v_step_id := uuid_generate_v4();
        END;
      ELSE
        v_step_id := uuid_generate_v4();
      END IF;
      
      -- Set creation timestamp
      IF step->>'created_at' IS NOT NULL THEN
        BEGIN
          v_created_at := (step->>'created_at')::timestamp with time zone;
        EXCEPTION WHEN others THEN
          v_created_at := now();
        END;
      ELSE
        v_created_at := now();
      END IF;
      
      RAISE NOTICE 'Inserting step % with ID % and workflow_id %', v_loop_index, v_step_id, v_workflow_id;
      
      -- Insert the step with explicit column names to prevent ambiguity
      BEGIN
        INSERT INTO workflow_steps (
          id,
          workflow_id,
          step_order,
          step_name,
          step_type,
          approver_id,
          approver_type,
          instructions,
          is_required,
          created_at
        ) VALUES (
          v_step_id,
          v_workflow_id,
          v_step_order,
          v_step_name,
          v_step_type,
          v_approver_id,
          v_approver_type,
          v_instructions,
          v_is_required,
          v_created_at
        );
        
        -- Add to inserted steps array
        inserted_steps := array_append(inserted_steps, jsonb_build_object(
          'id', v_step_id,
          'workflow_id', v_workflow_id,
          'step_order', v_step_order,
          'step_name', v_step_name,
          'step_type', v_step_type,
          'approver_id', v_approver_id,
          'approver_type', v_approver_type,
          'instructions', v_instructions,
          'is_required', v_is_required,
          'created_at', v_created_at
        ));
        
        RAISE NOTICE 'Successfully inserted step %', v_loop_index;
      EXCEPTION WHEN others THEN
        v_error := 'Error inserting step ' || v_loop_index || ': ' || SQLERRM;
        RAISE NOTICE '%', v_error;
        RAISE EXCEPTION '%', v_error;
      END;
    END LOOP;
    
    -- Return success result with inserted steps
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully inserted ' || array_length(inserted_steps, 1) || ' workflow steps',
      'data', inserted_steps
    );
    
    RETURN result;
  EXCEPTION WHEN others THEN
    -- Return error result
    result := jsonb_build_object(
      'success', false,
      'message', 'Error inserting workflow steps: ' || SQLERRM,
      'error', SQLERRM
    );
    
    RETURN result;
  END;
END;
$$;
