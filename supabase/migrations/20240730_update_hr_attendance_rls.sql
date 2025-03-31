
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow HR access" ON public.hr_attendance;
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.hr_attendance;

-- Create a policy to check HR access for all operations
CREATE POLICY "Allow HR access" 
ON public.hr_attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer', 'hr_manager'))
  )
);

-- Create a policy that lets users see their own attendance records
CREATE POLICY "Users can view their own attendance"
ON public.hr_attendance
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

-- Function to check if user has HR access
CREATE OR REPLACE FUNCTION public.has_hr_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    AND (r.name IN ('admin', 'app_admin', 'developer', 'hr_manager'))
  );
END;
$$;
