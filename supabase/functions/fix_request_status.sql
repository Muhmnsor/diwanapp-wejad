
-- Function to manually fix request status issues
CREATE OR REPLACE FUNCTION public.fix_request_status(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_data record;
  v_workflow_steps record;
  v_completed_steps integer;
  v_total_required_steps integer;
  v_completed_decision_steps integer;
  v_total_required_decision_steps integer;
  v_next_step_id uuid;
  v_result jsonb;
  v_was_modified boolean := false;
BEGIN
  -- Get request data
  SELECT * INTO v_request_data 
  FROM requests 
  WHERE id = p_request_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الطلب غير موجود'
    );
  END IF;
  
  -- Count completed and required steps with type information
  SELECT 
    COUNT(*) FILTER (WHERE ra.status = 'approved') AS completed_steps,
    COUNT(*) FILTER (WHERE ws.is_required) AS total_required_steps,
    COUNT(*) FILTER (WHERE ra.status = 'approved' AND ws.step_type = 'decision') AS completed_decision_steps,
    COUNT(*) FILTER (WHERE ws.is_required AND ws.step_type = 'decision') AS total_required_decision_steps
  INTO 
    v_completed_steps, v_total_required_steps, v_completed_decision_steps, v_total_required_decision_steps
  FROM 
    request_approvals ra 
    JOIN workflow_steps ws ON ra.step_id = ws.id
  WHERE 
    ra.request_id = p_request_id
    AND ws.workflow_id = v_request_data.workflow_id;
  
  -- Log findings
  RAISE NOTICE 'Request status: %, Completed steps: %, Required steps: %, Completed decision steps: %, Required decision steps: %', 
    v_request_data.status, v_completed_steps, v_total_required_steps, v_completed_decision_steps, v_total_required_decision_steps;
  
  -- Case 1: All required decision steps are completed (should mark as completed)
  IF v_completed_decision_steps >= v_total_required_decision_steps 
     AND v_request_data.status <> 'completed' THEN
    UPDATE requests 
    SET 
      status = 'completed',
      current_step_id = NULL,  -- Always set to NULL for completed requests
      updated_at = now()
    WHERE id = p_request_id;
    
    v_was_modified := true;
    v_result := jsonb_build_object(
      'action', 'marked_completed',
      'message', 'تم تحديث حالة الطلب إلى مكتمل وإزالة الخطوة الحالية',
      'debug', jsonb_build_object(
        'completed_decision_steps', v_completed_decision_steps,
        'total_required_decision_steps', v_total_required_decision_steps
      )
    );
  
  -- Case 2: Request has approved steps but is still pending
  ELSIF v_completed_steps > 0 AND v_request_data.status = 'pending' THEN
    UPDATE requests 
    SET 
      status = 'in_progress',
      updated_at = now()
    WHERE id = p_request_id;
    
    v_was_modified := true;
    v_result := jsonb_build_object(
      'action', 'marked_in_progress',
      'message', 'تم تحديث حالة الطلب إلى قيد المعالجة'
    );
  
  -- Case 3: Request is marked as completed but still has a current step
  ELSIF v_request_data.status = 'completed' AND v_request_data.current_step_id IS NOT NULL THEN
    UPDATE requests 
    SET 
      current_step_id = NULL,  -- Always set to NULL for completed requests
      updated_at = now()
    WHERE id = p_request_id;
    
    v_was_modified := true;
    v_result := jsonb_build_object(
      'action', 'removed_current_step',
      'message', 'تم إزالة الخطوة الحالية للطلب المكتمل'
    );
  
  -- Case 4: Find the next appropriate step if current step is missing
  ELSIF v_request_data.current_step_id IS NULL AND v_request_data.status IN ('pending', 'in_progress') THEN
    -- Check if all required decision steps are completed
    IF v_completed_decision_steps >= v_total_required_decision_steps THEN
      -- All required decision steps completed, mark as completed
      UPDATE requests 
      SET 
        status = 'completed',
        updated_at = now()
      WHERE id = p_request_id;
      
      v_was_modified := true;
      v_result := jsonb_build_object(
        'action', 'marked_completed_missing_step',
        'message', 'تم تحديث حالة الطلب إلى مكتمل (جميع الخطوات المطلوبة منجزة)'
      );
    ELSE
      -- Find the next step that hasn't been approved yet
      SELECT ws.id INTO v_next_step_id
      FROM workflow_steps ws
      WHERE ws.workflow_id = v_request_data.workflow_id
      AND ws.step_type = 'decision'  -- Prioritize decision steps
      AND NOT EXISTS (
        SELECT 1 FROM request_approvals ra 
        WHERE ra.request_id = p_request_id 
        AND ra.step_id = ws.id 
        AND ra.status = 'approved'
      )
      ORDER BY ws.step_order
      LIMIT 1;
      
      IF v_next_step_id IS NOT NULL THEN
        UPDATE requests 
        SET 
          current_step_id = v_next_step_id,
          status = 'in_progress',
          updated_at = now()
        WHERE id = p_request_id;
        
        v_was_modified := true;
        v_result := jsonb_build_object(
          'action', 'assigned_next_step',
          'message', 'تم تعيين الخطوة التالية للطلب',
          'next_step_id', v_next_step_id
        );
      ELSE
        -- All decision steps completed but status not updated
        UPDATE requests 
        SET 
          status = 'completed',
          updated_at = now()
        WHERE id = p_request_id;
        
        v_was_modified := true;
        v_result := jsonb_build_object(
          'action', 'marked_completed_no_next_step',
          'message', 'تم تحديث حالة الطلب إلى مكتمل (لا توجد خطوات قرار متبقية)'
        );
      END IF;
    END IF;
  ELSE
    v_result := jsonb_build_object(
      'action', 'no_action_needed',
      'message', 'لا توجد إجراءات مطلوبة'
    );
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'was_modified', v_was_modified,
    'request_id', p_request_id,
    'result', v_result,
    'debug', jsonb_build_object(
      'status', v_request_data.status,
      'current_step_id', v_request_data.current_step_id,
      'completed_steps', v_completed_steps,
      'total_required_steps', v_total_required_steps,
      'completed_decision_steps', v_completed_decision_steps,
      'total_required_decision_steps', v_total_required_decision_steps
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'حدث خطأ أثناء محاولة إصلاح الطلب: ' || SQLERRM
  );
END;
$$;
