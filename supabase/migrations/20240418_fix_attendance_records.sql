
-- 1. معالجة السجلات ذات القيم الفارغة لحقل employee_id

-- اطبع عدد السجلات التي تحتوي على قيم خالية
DO $$
DECLARE
    null_records INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_records FROM hr_attendance WHERE employee_id IS NULL;
    RAISE NOTICE 'عدد سجلات الحضور التي ليس لها موظف محدد: %', null_records;
END $$;

-- حذف السجلات التي ليس لها موظف محدد
DELETE FROM hr_attendance WHERE employee_id IS NULL;

-- 2. إضافة القيود المطلوبة الآن

-- إضافة قيد NOT NULL لحقل employee_id
ALTER TABLE hr_attendance
    ALTER COLUMN employee_id SET NOT NULL;

-- إضافة قيد FOREIGN KEY للتأكد من أن الموظف موجود في جدول الموظفين
ALTER TABLE hr_attendance
    ADD CONSTRAINT hr_attendance_employee_id_fk
    FOREIGN KEY (employee_id) REFERENCES employees(id);

-- إضافة قيد UNIQUE للتأكد من عدم وجود تكرار لنفس الموظف في نفس اليوم
ALTER TABLE hr_attendance
    ADD CONSTRAINT hr_attendance_unique_record
    UNIQUE (employee_id, attendance_date);

-- 3. تحديث دالة تسجيل الغياب لاستخدام القيود الجديدة
CREATE OR REPLACE FUNCTION public.mark_absent_employees(p_date date DEFAULT CURRENT_DATE, p_default_schedule_id uuid DEFAULT NULL::uuid)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_count integer := 0;
  v_result jsonb;
BEGIN
  -- تسجيل الغياب للموظفين الذين ليس لديهم سجل حضور لهذا اليوم
  INSERT INTO hr_attendance (
    employee_id,
    attendance_date,
    status,
    notes,
    created_by
  )
  SELECT 
    e.id,
    p_date,
    'absent',
    'تم تسجيل الغياب تلقائياً',
    NULL
  FROM employees e
  WHERE e.status = 'active'
    AND NOT EXISTS (
      SELECT 1 
      FROM hr_attendance a 
      WHERE a.employee_id = e.id 
      AND a.attendance_date = p_date
    )
  ON CONFLICT (employee_id, attendance_date) DO NOTHING;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم تسجيل ' || v_count || ' غياب',
    'count', v_count,
    'date', p_date
  );
  
  RETURN v_result;
END;
$$;
