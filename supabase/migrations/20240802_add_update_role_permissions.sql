
-- Function to update role permissions with improved transaction handling
CREATE OR REPLACE FUNCTION public.update_role_permissions(
  p_role_id uuid,
  p_permission_ids uuid[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Delete existing role permissions
    DELETE FROM public.role_permissions
    WHERE role_id = p_role_id;
    
    -- Insert new role permissions
    IF array_length(p_permission_ids, 1) > 0 THEN
      INSERT INTO public.role_permissions (role_id, permission_id)
      SELECT 
        p_role_id,
        permission_id
      FROM unnest(p_permission_ids) AS permission_id;
    END IF;
    
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating role permissions: %', SQLERRM;
    RETURN FALSE;
  END;
END;
$$;
