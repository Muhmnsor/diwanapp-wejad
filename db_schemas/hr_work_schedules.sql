
-- Create hr_work_schedules table
CREATE TABLE hr_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  work_hours_per_day NUMERIC(4,2) NOT NULL,
  work_days_per_week SMALLINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add a comment to the table
COMMENT ON TABLE hr_work_schedules IS 'Stores different work schedule configurations for employees';

-- Create RLS policies
ALTER TABLE hr_work_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies that only allow HR and admin users to modify this table
CREATE POLICY "HR users can read work schedules" 
ON hr_work_schedules
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer', 'hr_manager', 'hr'))
  )
);

CREATE POLICY "HR managers can modify work schedules" 
ON hr_work_schedules
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer', 'hr_manager'))
  )
);

-- Create hr_work_days table
CREATE TABLE hr_work_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES hr_work_schedules(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL, -- 0=Sunday, 1=Monday, etc.
  is_working_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(schedule_id, day_of_week)
);

-- Add a comment to the table
COMMENT ON TABLE hr_work_days IS 'Defines working days and hours for each work schedule';

-- Create RLS policies
ALTER TABLE hr_work_days ENABLE ROW LEVEL SECURITY;

-- Create policies that only allow HR and admin users to modify this table
CREATE POLICY "HR users can read work days" 
ON hr_work_days
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer', 'hr_manager', 'hr'))
  )
);

CREATE POLICY "HR managers can modify work days" 
ON hr_work_days
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer', 'hr_manager'))
  )
);

-- Alter employees table to add schedule_id
ALTER TABLE employees ADD COLUMN schedule_id UUID REFERENCES hr_work_schedules(id);

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_hr_work_schedules_timestamp
BEFORE UPDATE ON hr_work_schedules
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_hr_work_days_timestamp
BEFORE UPDATE ON hr_work_days
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Insert default work schedule
INSERT INTO hr_work_schedules (name, description, is_default, work_hours_per_day, work_days_per_week)
VALUES ('دوام كامل', 'دوام رسمي من الأحد إلى الخميس، 8 ساعات يومياً', true, 8, 5);

-- Get the ID of the default schedule
DO $$
DECLARE
  default_schedule_id UUID;
BEGIN
  SELECT id INTO default_schedule_id FROM hr_work_schedules WHERE is_default = true LIMIT 1;
  
  -- Insert work days for the default schedule
  INSERT INTO hr_work_days (schedule_id, day_of_week, is_working_day, start_time, end_time)
  VALUES
    (default_schedule_id, 0, true, '08:00:00', '16:00:00'),  -- Sunday
    (default_schedule_id, 1, true, '08:00:00', '16:00:00'),  -- Monday
    (default_schedule_id, 2, true, '08:00:00', '16:00:00'),  -- Tuesday
    (default_schedule_id, 3, true, '08:00:00', '16:00:00'),  -- Wednesday
    (default_schedule_id, 4, true, '08:00:00', '16:00:00'),  -- Thursday
    (default_schedule_id, 5, false, NULL, NULL),             -- Friday
    (default_schedule_id, 6, false, NULL, NULL);             -- Saturday
END $$;
