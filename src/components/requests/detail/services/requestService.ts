
import { supabase } from "@/integrations/supabase/client";

// Fetch request details
export const getRequestDetails = async (requestId: string) => {
  const { data, error } = await supabase
    .rpc('get_request_details', { p_request_id: requestId });
  
  if (error) throw error;
  return data;
};

// Diagnose workflow issues
export const diagnoseRequestWorkflow = async (requestId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('diagnose-workflow-issues', {
      body: { requestId }
    });
    
    if (error) throw error;
    return data?.data || data;
  } catch (error) {
    console.error("Error diagnosing workflow:", error);
    throw error;
  }
};

// Fix workflow issues
export const fixRequestWorkflow = async (requestId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('fix-request-status', {
      body: { requestId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fixing workflow:", error);
    throw error;
  }
};
