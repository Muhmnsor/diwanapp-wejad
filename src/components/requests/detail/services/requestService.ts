
import { supabase } from "@/integrations/supabase/client";

export const getRequestDetails = async (requestId: string) => {
  const { data, error } = await supabase
    .rpc('get_request_details', { p_request_id: requestId });
  
  if (error) {
    console.error("Error fetching request details:", error);
    throw error;
  }
  
  return data;
};
