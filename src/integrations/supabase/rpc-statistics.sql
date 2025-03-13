
-- Create a new RPC function to fetch request statistics in a single call
CREATE OR REPLACE FUNCTION public.get_request_statistics()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  total_count INT;
  pending_count INT;
  completed_count INT;
  rejected_count INT;
  in_progress_count INT;
  by_type_data json;
  by_status_data json;
  result json;
BEGIN
  -- Get request counts by status
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'rejected'),
    COUNT(*) FILTER (WHERE status NOT IN ('pending', 'completed', 'rejected'))
  INTO 
    total_count,
    pending_count,
    completed_count,
    rejected_count,
    in_progress_count
  FROM 
    requests;
  
  -- Get requests grouped by type
  WITH type_counts AS (
    SELECT 
      r.request_type_id AS type_id,
      rt.name AS type_name,
      COUNT(*) AS count
    FROM 
      requests r
      LEFT JOIN request_types rt ON r.request_type_id = rt.id
    GROUP BY 
      r.request_type_id, rt.name
  )
  SELECT json_agg(
    json_build_object(
      'typeId', type_id,
      'typeName', COALESCE(type_name, 'غير محدد'),
      'count', count
    )
  )
  INTO by_type_data
  FROM type_counts;
  
  -- Get requests grouped by status
  WITH status_counts AS (
    SELECT 
      status,
      COUNT(*) AS count
    FROM 
      requests
    GROUP BY 
      status
  )
  SELECT json_agg(
    json_build_object(
      'status', COALESCE(status, 'غير محدد'),
      'count', count
    )
  )
  INTO by_status_data
  FROM status_counts;
  
  -- Build and return the result
  result := json_build_object(
    'totalRequests', total_count,
    'pendingRequests', pending_count,
    'approvedRequests', completed_count,
    'rejectedRequests', rejected_count,
    'inProgressRequests', in_progress_count,
    'requestsByType', COALESCE(by_type_data, '[]'::json),
    'requestsByStatus', COALESCE(by_status_data, '[]'::json)
  );
  
  RETURN result;
END;
$function$;
