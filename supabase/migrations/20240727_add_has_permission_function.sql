
-- Function to check if a user has a specific permission (added debugging)
CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_perm boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = p_user_id
    AND p.name = p_permission_name
  ) INTO has_perm;
  
  -- Log for debugging
  INSERT INTO logs(log_type, message, details)
  VALUES (
    'permission_check', 
    'Permission check for user ' || p_user_id || ' and permission ' || p_permission_name,
    json_build_object('user_id', p_user_id, 'permission', p_permission_name, 'result', has_perm)
  );
  
  RETURN has_perm;
END;
$$;

-- Function to get all permissions for a user with debugging
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  permission_count integer;
BEGIN
  -- Count permissions first for logging
  SELECT COUNT(DISTINCT p.name)
  INTO permission_count
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  JOIN user_roles ur ON ur.role_id = rp.role_id
  WHERE ur.user_id = p_user_id;
  
  -- Log for debugging
  INSERT INTO logs(log_type, message, details)
  VALUES (
    'permission_fetch', 
    'Fetched permissions for user ' || p_user_id,
    json_build_object('user_id', p_user_id, 'permission_count', permission_count)
  );
  
  -- Return the permissions
  RETURN QUERY
  SELECT DISTINCT p.name
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  JOIN user_roles ur ON ur.role_id = rp.role_id
  WHERE ur.user_id = p_user_id;
END;
$$;
