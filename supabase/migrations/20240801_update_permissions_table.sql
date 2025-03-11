
-- Ensure permissions have unique names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'permissions_name_key'
  ) THEN
    ALTER TABLE public.permissions ADD CONSTRAINT permissions_name_key UNIQUE (name);
  END IF;
END $$;

-- Add index to speed up permission lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_permissions_name'
  ) THEN
    CREATE INDEX idx_permissions_name ON public.permissions (name);
  END IF;
END $$;

-- Add index to speed up role permission lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_role_permissions_role_id'
  ) THEN
    CREATE INDEX idx_role_permissions_role_id ON public.role_permissions (role_id);
  END IF;
END $$;

-- Add index for permission_id in role_permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_role_permissions_permission_id'
  ) THEN
    CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions (permission_id);
  END IF;
END $$;

-- Add index for user_id in user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_user_roles_user_id'
  ) THEN
    CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);
  END IF;
END $$;
