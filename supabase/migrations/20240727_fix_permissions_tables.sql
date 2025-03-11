
-- Make sure we have a logs table for debugging permission issues
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type text NOT NULL,
  message text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure the permissions table has the correct structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'permissions'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.permissions ADD COLUMN name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'permissions'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.permissions ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'permissions'
    AND column_name = 'module'
  ) THEN
    ALTER TABLE public.permissions ADD COLUMN module text;
  END IF;
END $$;

-- Make sure there's a unique constraint on permission name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'permissions_name_key'
  ) THEN
    ALTER TABLE public.permissions ADD CONSTRAINT permissions_name_key UNIQUE (name);
  END IF;
END $$;

-- Make sure there's a trigger to set updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_permissions_updated_at'
  ) THEN
    CREATE TRIGGER set_permissions_updated_at
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
