
-- Function to handle developer role assignment
CREATE OR REPLACE FUNCTION public.handle_developer_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the role is 'developer'
  IF EXISTS (SELECT 1 FROM roles WHERE id = NEW.role_id AND name = 'developer') THEN
    -- Update or insert developer settings when role is assigned
    INSERT INTO developer_settings (user_id, is_enabled)
    VALUES (NEW.user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_enabled = true,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for handling developer role assignment
CREATE TRIGGER on_developer_role_assigned
AFTER INSERT ON user_roles
FOR EACH ROW
EXECUTE FUNCTION handle_developer_role_assignment();

-- Function to check if a user has developer role
CREATE OR REPLACE FUNCTION public.has_developer_role(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND r.name = 'developer'
  );
END;
$$;

-- Function to check if a user is a developer (with permissions)
CREATE OR REPLACE FUNCTION public.is_developer(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    AND r.name = 'developer'
  );
END;
$$;

-- Update or create the policy for user_roles
CREATE POLICY "Enable read for authenticated users"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);
