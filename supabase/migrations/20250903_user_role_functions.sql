
-- وظيفة لتعيين دور للمستخدم
CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id UUID, p_role_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, p_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error assigning role: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- وظيفة لحذف أدوار المستخدم
CREATE OR REPLACE FUNCTION public.delete_user_roles(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting roles: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- تحديث constraint على جدول user_roles
ALTER TABLE IF EXISTS public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_pkey;
  
ALTER TABLE IF EXISTS public.user_roles
  ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);
