
-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  category TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(module, name)
);

-- Create role_permissions table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(role_id, permission_id)
);

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for permissions table to allow all authenticated users to read
CREATE POLICY "Allow read access for all authenticated users"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

-- Create policy for role_permissions table to allow all authenticated users to read
CREATE POLICY "Allow read access for all authenticated users"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- Create policy for role_permissions to allow admins to insert
CREATE POLICY "Allow admins to insert role_permissions"
ON public.role_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
);

-- Create policy for role_permissions to allow admins to update
CREATE POLICY "Allow admins to update role_permissions"
ON public.role_permissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
);

-- Create policy for role_permissions to allow admins to delete
CREATE POLICY "Allow admins to delete role_permissions"
ON public.role_permissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND (r.name = 'admin' OR r.name = 'app_admin')
  )
);

-- Create permissions view to make it easier to query
CREATE OR REPLACE VIEW public.permissions_view AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.module,
  p.category,
  p.display_name,
  COUNT(rp.role_id) AS roles_count
FROM 
  public.permissions p
LEFT JOIN 
  public.role_permissions rp ON p.id = rp.permission_id
GROUP BY 
  p.id, p.name, p.description, p.module, p.category, p.display_name;

-- Create role_permissions view to make it easier to query
CREATE OR REPLACE VIEW public.role_permissions_view AS
SELECT 
  rp.id,
  rp.role_id,
  r.name AS role_name,
  rp.permission_id,
  p.name AS permission_name,
  p.module,
  p.category
FROM 
  public.role_permissions rp
JOIN 
  public.roles r ON rp.role_id = r.id
JOIN 
  public.permissions p ON rp.permission_id = p.id;
