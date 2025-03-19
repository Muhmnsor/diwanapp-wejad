
CREATE OR REPLACE FUNCTION public.count_meetings_by_folder()
RETURNS TABLE(folder_id uuid, count bigint) 
LANGUAGE SQL
AS $$
  SELECT 
    folder_id,
    COUNT(*) as count
  FROM 
    meetings
  WHERE 
    folder_id IS NOT NULL
  GROUP BY 
    folder_id;
$$;
