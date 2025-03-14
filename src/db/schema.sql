
-- تبسيط دالة حذف أنواع الطلبات مع التعامل فقط مع الخطوات الأساسية
CREATE OR REPLACE FUNCTION public.delete_request_type(p_request_type_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_related_requests int;
BEGIN
  -- التحقق من صلاحيات المستخدم
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) INTO v_is_admin;
  
  -- السماح فقط للمشرفين بحذف أنواع الطلبات
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف أنواع الطلبات'
    );
  END IF;

  -- التحقق من وجود طلبات مرتبطة بهذا النوع
  SELECT COUNT(*)
  INTO v_related_requests
  FROM requests
  WHERE request_type_id = p_request_type_id;
  
  IF v_related_requests > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لا يمكن حذف نوع الطلب لأنه مرتبط بـ ' || v_related_requests || ' من الطلبات الموجودة'
    );
  END IF;

  -- التأكد من وجود نوع الطلب
  IF NOT EXISTS (SELECT 1 FROM request_types WHERE id = p_request_type_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'نوع الطلب غير موجود'
    );
  END IF;

  -- حذف نوع الطلب مباشرة والاعتماد على CASCADE للعلاقات
  DELETE FROM request_types WHERE id = p_request_type_id;

  -- إعادة نتيجة نجاح العملية
  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف نوع الطلب بنجاح',
    'request_type_id', p_request_type_id
  );

EXCEPTION WHEN OTHERS THEN
  -- إعادة رسالة خطأ مبسطة
  RETURN jsonb_build_object(
    'success', false,
    'message', 'حدث خطأ أثناء حذف نوع الطلب: ' || SQLERRM
  );
END;
$function$;


-- تبسيط دالة حذف الطلبات
CREATE OR REPLACE FUNCTION public.delete_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_has_permission boolean;
BEGIN
  -- التحقق من وجود الطلب
  IF NOT EXISTS (SELECT 1 FROM requests WHERE id = p_request_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الطلب غير موجود'
    );
  END IF;
  
  -- التحقق إذا كان المستخدم مشرف أو منشئ الطلب
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) OR v_user_id = (SELECT requester_id FROM requests WHERE id = p_request_id)
  INTO v_has_permission;
  
  IF NOT v_has_permission THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'ليس لديك صلاحية لحذف هذا الطلب'
    );
  END IF;
  
  -- حذف الطلب مباشرةً والاعتماد على CASCADE
  BEGIN
    -- إزالة المرجع إلى الخطوة لتجنب أخطاء العلاقات
    UPDATE requests
    SET current_step_id = NULL
    WHERE id = p_request_id;
    
    -- حذف الطلب
    DELETE FROM requests WHERE id = p_request_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'تم حذف الطلب بنجاح',
      'request_id', p_request_id
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف الطلب: ' || SQLERRM
    );
  END;
END;
$function$;
