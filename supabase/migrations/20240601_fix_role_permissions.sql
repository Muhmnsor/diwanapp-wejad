
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
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
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
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
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
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
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
        WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'app_admin', 'developer')
    ) INTO is_admin_result;
    RETURN is_admin_result;
END; 
$$;

-- Create app_permissions table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.app_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  app_name TEXT NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE
);

-- Add unique constraint to prevent duplicate permissions
ALTER TABLE public.app_permissions 
ADD CONSTRAINT IF NOT EXISTS app_permissions_role_app_unique UNIQUE (role_id, app_name);

-- RLS policies for app_permissions
ALTER TABLE IF EXISTS public.app_permissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_permissions' AND policyname = 'Allow read access for all authenticated users'
    ) THEN
        CREATE POLICY "Allow read access for all authenticated users"
        ON public.app_permissions
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_permissions' AND policyname = 'Allow admins to insert app permissions'
    ) THEN
        CREATE POLICY "Allow admins to insert app permissions"
        ON public.app_permissions
        FOR INSERT
        TO authenticated
        WITH CHECK (
          public.is_admin()
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_permissions' AND policyname = 'Allow admins to update app permissions'
    ) THEN
        CREATE POLICY "Allow admins to update app permissions"
        ON public.app_permissions
        FOR UPDATE
        TO authenticated
        USING (
          public.is_admin()
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_permissions' AND policyname = 'Allow admins to delete app permissions'
    ) THEN
        CREATE POLICY "Allow admins to delete app permissions"
        ON public.app_permissions
        FOR DELETE
        TO authenticated
        USING (
          public.is_admin()
        );
    END IF;
END
$$;

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
  -- Check if user is admin/app_admin/developer (they have all permissions)
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
