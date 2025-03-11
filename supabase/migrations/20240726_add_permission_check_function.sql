
-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = p_user_id
    AND p.name = p_permission_name
  );
END;
$$;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  JOIN user_roles ur ON ur.role_id = rp.role_id
  WHERE ur.user_id = p_user_id;
END;
$$;
