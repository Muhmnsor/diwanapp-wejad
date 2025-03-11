
-- Add transaction management functions
CREATE OR REPLACE FUNCTION public.begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Start a transaction
  BEGIN;
END;
$$;

CREATE OR REPLACE FUNCTION public.commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Commit the transaction
  COMMIT;
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Rollback the transaction
  ROLLBACK;
END;
$$;

-- Update the has_permission function with additional logging
CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_perm boolean;
  user_roles text[];
BEGIN
  -- Get all the user roles for logging
  SELECT array_agg(r.name) INTO user_roles
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = p_user_id;

  -- Check if the user has the permission
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
    json_build_object(
      'user_id', p_user_id, 
      'permission', p_permission_name, 
      'result', has_perm,
      'user_roles', user_roles
    )
  );
  
  RETURN has_perm;
END;
$$;
