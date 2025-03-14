
-- Fix foreign key constraints for request_workflow_operation_logs

-- First, handle any orphaned records by setting their step_id to NULL
UPDATE request_workflow_operation_logs
SET step_id = NULL
WHERE step_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM workflow_steps WHERE id = request_workflow_operation_logs.step_id
);

-- Do the same for the older workflow_operation_logs table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workflow_operation_logs'
  ) THEN
    UPDATE workflow_operation_logs
    SET step_id = NULL
    WHERE step_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM workflow_steps WHERE id = workflow_operation_logs.step_id
    );
  END IF;
END
$$;

-- Also handle orphaned records in request_approval_logs
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'request_approval_logs'
  ) THEN
    UPDATE request_approval_logs
    SET step_id = NULL
    WHERE step_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM workflow_steps WHERE id = request_approval_logs.step_id
    );
  END IF;
END
$$;

-- Modify the foreign key constraints to SET NULL on delete for request_workflow_operation_logs
DO $$
BEGIN
  -- Drop existing constraints if they exist
  IF EXISTS (
    SELECT FROM pg_constraint 
    WHERE conname = 'workflow_operation_logs_request_type_id_fkey'
    AND conrelid = 'request_workflow_operation_logs'::regclass
  ) THEN
    ALTER TABLE request_workflow_operation_logs 
    DROP CONSTRAINT workflow_operation_logs_request_type_id_fkey;
    
    -- Re-add with ON DELETE SET NULL
    ALTER TABLE request_workflow_operation_logs 
    ADD CONSTRAINT workflow_operation_logs_request_type_id_fkey 
    FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT FROM pg_constraint 
    WHERE conname = 'workflow_operation_logs_workflow_id_fkey'
    AND conrelid = 'request_workflow_operation_logs'::regclass
  ) THEN
    ALTER TABLE request_workflow_operation_logs 
    DROP CONSTRAINT workflow_operation_logs_workflow_id_fkey;
    
    -- Re-add with ON DELETE SET NULL
    ALTER TABLE request_workflow_operation_logs 
    ADD CONSTRAINT workflow_operation_logs_workflow_id_fkey 
    FOREIGN KEY (workflow_id) REFERENCES request_workflows(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT FROM pg_constraint 
    WHERE conname = 'workflow_operation_logs_step_id_fkey'
    AND conrelid = 'request_workflow_operation_logs'::regclass
  ) THEN
    ALTER TABLE request_workflow_operation_logs 
    DROP CONSTRAINT workflow_operation_logs_step_id_fkey;
    
    -- Re-add with ON DELETE SET NULL
    ALTER TABLE request_workflow_operation_logs 
    ADD CONSTRAINT workflow_operation_logs_step_id_fkey 
    FOREIGN KEY (step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Handle the old workflow_operation_logs table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workflow_operation_logs'
  ) THEN
    -- Drop and recreate constraints for the old table
    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'workflow_operation_logs_request_type_id_fkey'
      AND conrelid = 'workflow_operation_logs'::regclass
    ) THEN
      ALTER TABLE workflow_operation_logs 
      DROP CONSTRAINT workflow_operation_logs_request_type_id_fkey;
      
      ALTER TABLE workflow_operation_logs 
      ADD CONSTRAINT workflow_operation_logs_request_type_id_fkey 
      FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'workflow_operation_logs_workflow_id_fkey'
      AND conrelid = 'workflow_operation_logs'::regclass
    ) THEN
      ALTER TABLE workflow_operation_logs 
      DROP CONSTRAINT workflow_operation_logs_workflow_id_fkey;
      
      ALTER TABLE workflow_operation_logs 
      ADD CONSTRAINT workflow_operation_logs_workflow_id_fkey 
      FOREIGN KEY (workflow_id) REFERENCES request_workflows(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'workflow_operation_logs_step_id_fkey'
      AND conrelid = 'workflow_operation_logs'::regclass
    ) THEN
      ALTER TABLE workflow_operation_logs 
      DROP CONSTRAINT workflow_operation_logs_step_id_fkey;
      
      ALTER TABLE workflow_operation_logs 
      ADD CONSTRAINT workflow_operation_logs_step_id_fkey 
      FOREIGN KEY (step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

-- Handle the request_approval_logs table
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'request_approval_logs'
  ) THEN
    IF EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'request_approval_logs_step_id_fkey'
    ) THEN
      ALTER TABLE request_approval_logs 
      DROP CONSTRAINT request_approval_logs_step_id_fkey;
      
      ALTER TABLE request_approval_logs 
      ADD CONSTRAINT request_approval_logs_step_id_fkey 
      FOREIGN KEY (step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

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
    
    RETURN result;
  EXCEPTION WHEN others THEN
    -- Return error result
    v_error := SQLERRM;
    result := jsonb_build_object(
      'success', false,
      'message', 'Error inserting workflow steps: ' || v_error,
      'error', v_error
    );
    
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
