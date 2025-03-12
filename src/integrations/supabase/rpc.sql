
-- UPDATED FUNCTION: Update request after rejection
CREATE OR REPLACE FUNCTION public.update_request_after_rejection(p_request_id uuid, p_step_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE requests
  SET 
    status = 'rejected',
    updated_at = now()
  WHERE 
    id = p_request_id;
      
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم رفض الطلب بنجاح'
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'حدث خطأ أثناء تحديث حالة الطلب: ' || SQLERRM
  );
END;
$$;
