
-- Add RLS policies to roles table to allow admins to manage roles
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the roles table
CREATE POLICY "Allow read access for all authenticated users"
ON public.roles
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to insert roles
CREATE POLICY "Allow admins to insert roles"
ON public.roles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
);

-- Allow admins to update roles
CREATE POLICY "Allow admins to update roles"
ON public.roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
);

-- Allow admins to delete roles
CREATE POLICY "Allow admins to delete roles"
ON public.roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
);

-- Ensure user_roles table has proper structure and permissions
ALTER TABLE IF EXISTS public.user_roles ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Create a function to check admin status (to avoid recursion in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE is_admin_result boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM user_roles ur 
        JOIN roles r ON r.id = ur.role_id 
        WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'app_admin')
    ) INTO is_admin_result;
    RETURN is_admin_result;
END; 
$$;
