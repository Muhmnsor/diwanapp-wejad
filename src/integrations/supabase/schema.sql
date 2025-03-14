

-- تحديث دالة إدراج خطوات سير العمل لتكون أكثر قوة وأمانًا
CREATE OR REPLACE FUNCTION public.insert_workflow_steps(steps jsonb[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  step jsonb;
  result jsonb;
  inserted_steps jsonb[] := '{}';
  step_result jsonb;
  v_is_admin boolean;
  v_error text;
  v_workflow_id uuid;
  v_workflow_ids uuid[] := '{}';
  v_step_count int := 0;
  v_is_valid_uuid boolean;
  v_step_id uuid;
  v_loop_index int;
BEGIN
  -- Check if user is admin or developer
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لإدارة خطوات سير العمل'
    );
  END IF;

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
      
      -- Validate workflow ID exists in each step
      IF step->>'workflow_id' IS NULL THEN
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
    FOR v_loop_index IN 1..v_step_count LOOP
      step := steps[v_loop_index];
      
      -- Extract and validate workflow_id
      BEGIN
        v_workflow_id := (step->>'workflow_id')::uuid;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid UUID format for workflow_id in step %', v_loop_index;
      END;
      
      -- Validate workflow exists
      IF NOT EXISTS (SELECT 1 FROM request_workflows WHERE id = v_workflow_id) THEN
        RAISE EXCEPTION 'Workflow with ID % does not exist', v_workflow_id;
      END IF;
      
      -- Check if step ID is provided
      IF step->>'id' IS NOT NULL AND (step->>'id') != 'null' AND (step->>'id') != '' THEN
        BEGIN
          v_step_id := (step->>'id')::uuid;
        EXCEPTION WHEN others THEN
          v_step_id := uuid_generate_v4();
        END;
      ELSE
        v_step_id := uuid_generate_v4();
      END IF;
      
      -- Insert the step
      INSERT INTO workflow_steps (
        id,
        workflow_id,
        step_order, 
        step_name,
        step_type,
        approver_id,
        approver_type,
        instructions,
        is_required
      ) VALUES (
        v_step_id,
        v_workflow_id,
        COALESCE((step->>'step_order')::integer, v_loop_index),
        step->>'step_name',
        COALESCE(step->>'step_type', 'decision'),
        (step->>'approver_id')::uuid,
        COALESCE(step->>'approver_type', 'user'),
        step->>'instructions',
        COALESCE((step->>'is_required')::boolean, true)
      );
      
      -- Add to inserted steps array
      inserted_steps := array_append(inserted_steps, jsonb_build_object(
        'id', v_step_id,
        'workflow_id', v_workflow_id,
        'step_order', COALESCE((step->>'step_order')::integer, v_loop_index),
        'step_name', step->>'step_name',
        'step_type', COALESCE(step->>'step_type', 'decision'),
        'approver_id', (step->>'approver_id')::uuid,
        'approver_type', COALESCE(step->>'approver_type', 'user'),
        'instructions', step->>'instructions',
        'is_required', COALESCE((step->>'is_required')::boolean, true),
        'created_at', now()
      ));
    END LOOP;
    
    -- Return success result with inserted steps
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully inserted ' || array_length(inserted_steps, 1) || ' workflow steps',
      'data', inserted_steps
    );
    
    -- Try to log the operation
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'request_workflow_operation_logs'
      ) THEN
        INSERT INTO request_workflow_operation_logs(
          operation_type,
          user_id,
          workflow_id,
          request_data,
          response_data,
          details
        ) VALUES (
          'insert_workflow_steps',
          auth.uid(),
          v_workflow_ids[1],
          to_jsonb(steps),
          result,
          'تم حفظ خطوات سير العمل بنجاح'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If logging fails, just continue
      RAISE NOTICE 'Failed to log workflow operation: %', SQLERRM;
    END;
    
    RETURN result;
  EXCEPTION WHEN others THEN
    -- Return error result
    v_error := SQLERRM;
    result := jsonb_build_object(
      'success', false,
      'message', 'Error inserting workflow steps: ' || v_error,
      'error', v_error
    );
    
    -- Try to log the error
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'request_workflow_operation_logs'
      ) THEN
        INSERT INTO request_workflow_operation_logs(
          operation_type,
          user_id,
          request_data,
          error_message,
          details
        ) VALUES (
          'insert_workflow_steps_error',
          auth.uid(),
          to_jsonb(steps),
          v_error,
          'فشل في حفظ خطوات سير العمل'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If logging fails, just continue
      RAISE NOTICE 'Failed to log workflow error: %', SQLERRM;
    END;
    
    RETURN result;
  END;
END;
$function$;

-- إضافة سياسات RLS جديدة لضمان عمل حذف وتعديل خطوات سير العمل
DO $$
BEGIN
  -- Delete any existing policies that might conflict
  DROP POLICY IF EXISTS "Allow admins to delete workflow steps" ON public.workflow_steps;
  DROP POLICY IF EXISTS "Allow admins to insert workflow steps" ON public.workflow_steps;
  DROP POLICY IF EXISTS "Allow admins to update workflow steps" ON public.workflow_steps;
  DROP POLICY IF EXISTS "Allow admins to select workflow steps" ON public.workflow_steps;
  
  -- Ensure RLS is enabled
  ALTER TABLE IF EXISTS public.workflow_steps ENABLE ROW LEVEL SECURITY;
  
  -- Create comprehensive policies
  CREATE POLICY "Allow admins to delete workflow steps"
  ON public.workflow_steps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name IN ('admin', 'app_admin', 'developer'))
    )
  );
  
  CREATE POLICY "Allow admins to insert workflow steps"
  ON public.workflow_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name IN ('admin', 'app_admin', 'developer'))
    )
  );
  
  CREATE POLICY "Allow admins to update workflow steps"
  ON public.workflow_steps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name IN ('admin', 'app_admin', 'developer'))
    )
  );
  
  CREATE POLICY "Allow admins to select workflow steps"
  ON public.workflow_steps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name IN ('admin', 'app_admin', 'developer'))
    )
  );
END
$$;

