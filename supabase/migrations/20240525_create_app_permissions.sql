
-- Create app_permissions table to store app access rights per role
CREATE TABLE IF NOT EXISTS public.app_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  app_name TEXT NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE
);

-- Add unique constraint to prevent duplicate permissions
ALTER TABLE public.app_permissions ADD CONSTRAINT app_permissions_role_app_unique UNIQUE (role_id, app_name);

-- Enable Row Level Security
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading app permissions to all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
ON public.app_permissions
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow admins to insert app permissions
CREATE POLICY "Allow admins to insert app permissions"
ON public.app_permissions
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

-- Policy to allow admins to update app permissions
CREATE POLICY "Allow admins to update app permissions"
ON public.app_permissions
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

-- Policy to allow admins to delete app permissions
CREATE POLICY "Allow admins to delete app permissions"
ON public.app_permissions
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

-- Create a function to check if a user has access to an app
CREATE OR REPLACE FUNCTION public.check_user_app_access(
  p_user_id UUID,
  p_app_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_access BOOLEAN := FALSE;
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if user is admin/app_admin (they have all permissions)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check role-based permissions
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN app_permissions ap ON ur.role_id = ap.role_id
    WHERE ur.user_id = p_user_id
    AND ap.app_name = p_app_name
  ) INTO v_has_access;
  
  RETURN v_has_access;
END;
$$;

-- Comment on app_permissions table
COMMENT ON TABLE public.app_permissions IS 'Stores app access permissions for roles';
