
-- Update the get_organizational_hierarchy function to include position_type
CREATE OR REPLACE FUNCTION public.get_organizational_hierarchy()
 RETURNS TABLE(id uuid, name text, description text, unit_type text, parent_id uuid, level integer, path uuid[], position_type text)
 LANGUAGE sql
AS $function$
WITH RECURSIVE org_hierarchy AS (
  -- Base case: select all units without a parent
  SELECT 
    u.id,
    u.name,
    u.description,
    u.unit_type,
    u.parent_id,
    1 as level,
    ARRAY[u.id] as path,
    COALESCE(u.position_type, 'standard') as position_type
  FROM organizational_units u
  WHERE u.parent_id IS NULL AND u.is_active = true
  
  UNION ALL
  
  -- Recursive case: join with units that have the current unit as parent
  SELECT
    c.id,
    c.name,
    c.description,
    c.unit_type,
    c.parent_id,
    p.level + 1 as level,
    p.path || c.id as path,
    COALESCE(c.position_type, 'standard') as position_type
  FROM organizational_units c
  JOIN org_hierarchy p ON c.parent_id = p.id
  WHERE c.is_active = true
)
SELECT * FROM org_hierarchy
ORDER BY level, name;
$function$;

-- Function to update the get_organizational_hierarchy function (for admin use)
CREATE OR REPLACE FUNCTION public.update_organizational_hierarchy_function()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Recreate the function
  EXECUTE '
  CREATE OR REPLACE FUNCTION public.get_organizational_hierarchy()
   RETURNS TABLE(id uuid, name text, description text, unit_type text, parent_id uuid, level integer, path uuid[], position_type text)
   LANGUAGE sql
  AS $func$
  WITH RECURSIVE org_hierarchy AS (
    -- Base case: select all units without a parent
    SELECT 
      u.id,
      u.name,
      u.description,
      u.unit_type,
      u.parent_id,
      1 as level,
      ARRAY[u.id] as path,
      COALESCE(u.position_type, ''standard'') as position_type
    FROM organizational_units u
    WHERE u.parent_id IS NULL AND u.is_active = true
    
    UNION ALL
    
    -- Recursive case: join with units that have the current unit as parent
    SELECT
      c.id,
      c.name,
      c.description,
      c.unit_type,
      c.parent_id,
      p.level + 1 as level,
      p.path || c.id as path,
      COALESCE(c.position_type, ''standard'') as position_type
    FROM organizational_units c
    JOIN org_hierarchy p ON c.parent_id = p.id
    WHERE c.is_active = true
  )
  SELECT * FROM org_hierarchy
  ORDER BY level, name;
  $func$;
  ';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating function: %', SQLERRM;
    RETURN false;
END;
$function$;
