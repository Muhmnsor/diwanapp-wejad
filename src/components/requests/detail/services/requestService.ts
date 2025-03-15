
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

export const diagnoseRequestWorkflow = async (requestId: string) => {
  try {
    // Call the diagnostic function
    const { data, error } = await supabase
      .rpc('diagnose_workflow_issues', { p_request_id: requestId });
    
    if (error) {
      console.error("Error diagnosing workflow:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in workflow diagnosis:", error);
    throw error;
  }
};

export const updateWorkflowStep = async (
  requestId: string, 
  currentStepId: string, 
  action: 'approve' | 'reject' | 'complete',
  metadata?: Record<string, any>
) => {
  try {
    // Use the Edge Function to update the workflow
    const { data, error } = await supabase.functions.invoke('update-workflow-step', {
      body: {
        requestId,
        currentStepId,
        action,
        metadata
      }
    });
    
    if (error) {
      console.error("Error updating workflow step:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in workflow step update:", error);
    throw error;
  }
};
