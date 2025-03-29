
-- Create or replace the has_hr_access function to check if a user has HR access
CREATE OR REPLACE FUNCTION public.has_hr_access(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_has_hr_role BOOLEAN;
BEGIN
  -- Check if user is admin first (they have access to everything)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has hr_manager role
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name = 'hr_manager'
  ) INTO v_has_hr_role;
  
  RETURN v_has_hr_role;
END;
$$;

-- Comment on function
COMMENT ON FUNCTION public.has_hr_access IS 'Checks if a user has access to HR module';
