
-- Create a trigger on requests table to sync leave requests
CREATE OR REPLACE FUNCTION sync_leave_request_trigger()
RETURNS TRIGGER AS $$
DECLARE
  req_type_name TEXT;
BEGIN
  -- Check if this is a leave request type
  SELECT name INTO req_type_name FROM request_types WHERE id = NEW.request_type_id;
  
  IF (req_type_name ILIKE '%leave%' OR req_type_name ILIKE '%إجازة%') AND 
     (NEW.status != OLD.status OR TG_OP = 'INSERT') THEN
    -- Sync the leave request using the http client
    PERFORM
      net.http_post(
        url := 'https://' || current_setting('request.host') || '/functions/v1/syncLeaveRequests',
        body := json_build_object(
          'record', json_build_object('request_id', NEW.id),
          'type', TG_OP
        )::text,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('supabase_functions.key')
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS requests_sync_leave_trigger ON requests;

-- Create the trigger
CREATE TRIGGER requests_sync_leave_trigger
AFTER INSERT OR UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION sync_leave_request_trigger();

-- Make sure we have leave request type
INSERT INTO request_types (id, name, description, form_schema, is_active)
VALUES (
  'leave-request',
  'طلب إجازة',
  'نموذج طلب إجازة للموظفين',
  '{
    "fields": [
      {
        "id": "leave_type",
        "name": "leave_type",
        "label": "نوع الإجازة",
        "type": "select",
        "required": true,
        "options": ["سنوية", "مرضية", "اضطرارية", "استثنائية"]
      },
      {
        "id": "start_date",
        "name": "start_date",
        "label": "تاريخ بداية الإجازة",
        "type": "date",
        "required": true
      },
      {
        "id": "end_date",
        "name": "end_date",
        "label": "تاريخ نهاية الإجازة",
        "type": "date",
        "required": true
      },
      {
        "id": "employee_id",
        "name": "employee_id",
        "label": "رقم الموظف",
        "type": "text",
        "required": true
      },
      {
        "id": "reason",
        "name": "reason",
        "label": "سبب الإجازة",
        "type": "textarea",
        "required": false
      }
    ]
  }',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Create a basic default workflow for leave requests
DO $$
DECLARE
  default_admin_id UUID;
  workflow_id UUID;
BEGIN
  -- Find a user with admin role to be the default approver
  SELECT user_id INTO default_admin_id
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.name = 'admin' OR r.name = 'hr_admin'
  LIMIT 1;

  -- Create default workflow if it doesn't exist
  INSERT INTO request_workflows (id, name, description, is_active, request_type_id)
  VALUES (
    uuid_generate_v4(),
    'سير عمل طلبات الإجازة',
    'سير العمل الافتراضي لطلبات الإجازة',
    true,
    'leave-request'
  )
  RETURNING id INTO workflow_id
  ON CONFLICT (id) DO NOTHING;
  
  -- Update request type with default workflow
  UPDATE request_types 
  SET default_workflow_id = workflow_id
  WHERE id = 'leave-request'
  AND (default_workflow_id IS NULL OR default_workflow_id != workflow_id);
  
  -- Add workflow steps if admin user found
  IF default_admin_id IS NOT NULL AND workflow_id IS NOT NULL THEN
    -- Add HR review step
    INSERT INTO request_workflow_steps (
      workflow_id, step_name, step_type, approver_id, approver_type,
      is_required, step_order, instructions
    )
    VALUES (
      workflow_id,
      'مراجعة إدارة الموارد البشرية',
      'decision',
      default_admin_id,
      'user',
      true,
      1,
      'مراجعة طلب الإجازة والتأكد من استحقاق الموظف'
    )
    ON CONFLICT DO NOTHING;
    
    -- Add manager approval step
    INSERT INTO request_workflow_steps (
      workflow_id, step_name, step_type, approver_id, approver_type,
      is_required, step_order, instructions
    )
    VALUES (
      workflow_id,
      'موافقة المدير المباشر',
      'decision',
      default_admin_id,
      'user',
      true,
      2,
      'موافقة المدير المباشر على طلب الإجازة'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create leave types if they don't exist
INSERT INTO hr_leave_types (name, description, max_days_per_year, is_paid, color)
VALUES 
  ('سنوية', 'الإجازة السنوية المستحقة', 30, true, '#10B981'),
  ('مرضية', 'إجازة مرضية', 30, true, '#F59E0B'),
  ('اضطرارية', 'إجازة اضطرارية', 10, true, '#3B82F6'),
  ('استثنائية', 'إجازة استثنائية بدون راتب', 0, false, '#6B7280')
ON CONFLICT (name) DO NOTHING;
