
-- Updated function for checking specific permissions with better Arabic module name support
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_app_name TEXT,
  p_permission_name TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_is_admin BOOLEAN := FALSE;
  v_has_direct_permission BOOLEAN := FALSE;
  v_module_name TEXT;
BEGIN
  -- First check if user is admin/app_admin/developer (they have all permissions)
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
  
  -- Map app name to module if needed (for Arabic module names)
  CASE p_app_name
    WHEN 'events' THEN v_module_name := 'الفعاليات';
    WHEN 'documents' THEN v_module_name := 'المستندات';
    WHEN 'tasks' THEN v_module_name := 'المهام';
    WHEN 'ideas' THEN v_module_name := 'الأفكار';
    WHEN 'finance' THEN v_module_name := 'المالية';
    WHEN 'users' THEN v_module_name := 'المستخدمين';
    WHEN 'website' THEN v_module_name := 'الموقع الإلكتروني';
    WHEN 'store' THEN v_module_name := 'المتجر الإلكتروني';
    WHEN 'notifications' THEN v_module_name := 'الإشعارات';
    WHEN 'requests' THEN v_module_name := 'الطلبات';
    WHEN 'developer' THEN v_module_name := 'أدوات المطور';
    ELSE v_module_name := p_app_name;
  END CASE;
  
  -- Check for specific permissions via role_permissions
  -- First try with the original app name
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND p.module = p_app_name
    AND p.name = p_permission_name
  ) INTO v_has_direct_permission;
  
  -- If not found with original app name, try with mapped module name
  IF NOT v_has_direct_permission AND v_module_name <> p_app_name THEN
    SELECT EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = p_user_id
      AND p.module = v_module_name
      AND p.name = p_permission_name
    ) INTO v_has_direct_permission;
  END IF;
  
  RETURN v_has_direct_permission;
END;
$$;

-- Updated function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  app TEXT,
  permission TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin/app_admin/developer (they have all permissions)
  IF EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND (r.name = 'admin' OR r.name = 'app_admin' OR r.name = 'developer')
  ) THEN
    -- Return all permissions for admins
    RETURN QUERY
    SELECT DISTINCT module, name
    FROM permissions;
  ELSE
    -- Return only permissions assigned to the user's roles
    RETURN QUERY
    SELECT DISTINCT p.module, p.name
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id;
  END IF;
END;
$$;
