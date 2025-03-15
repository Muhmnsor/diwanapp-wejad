
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getRequestDetails = async (requestId: string) => {
  try {
    console.log("Fetching request details for ID:", requestId);
    
    const { data, error } = await supabase
      .rpc('get_request_details', { p_request_id: requestId });
    
    if (error) {
      console.error("Error fetching request details:", error);
      throw error;
    }
    
    console.log("Request details loaded successfully");
    return data;
  } catch (error) {
    console.error("Exception in getRequestDetails:", error);
    throw error;
  }
};

export const diagnoseRequestWorkflow = async (requestId: string) => {
  try {
    console.log("Diagnosing workflow issues for request:", requestId);
    
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
    console.log(`Updating workflow step for request ${requestId}, step ${currentStepId}, action ${action}`);
    
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
      toast.error("حدث خطأ أثناء تحديث حالة الطلب");
      throw error;
    }
    
    console.log("Workflow step updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in workflow step update:", error);
    toast.error("حدث خطأ في عملية تحديث سير العمل");
    throw error;
  }
};

// Add a new function to help users diagnose specific issues
export const debugRequestWorkflow = async (requestId: string) => {
  try {
    console.log("Running debug checks for request:", requestId);
    
    // Get the raw request data with a simpler query to check fields
    const { data: rawRequest, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        current_step_id,
        workflow_id,
        requester_id,
        status
      `)
      .eq('id', requestId)
      .single();
    
    if (requestError) {
      console.error("Error fetching raw request:", requestError);
      return {
        success: false,
        error: requestError.message,
        debug_info: { type: "request_fetch_error" }
      };
    }
    
    // Check if the workflow exists
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, name')
      .eq('id', rawRequest.workflow_id)
      .single();
    
    if (workflowError) {
      return {
        success: false,
        error: "لا يمكن العثور على مسار العمل المرتبط بالطلب",
        debug_info: { 
          type: "missing_workflow",
          workflow_id: rawRequest.workflow_id
        }
      };
    }
    
    // Check if current step exists
    if (rawRequest.current_step_id) {
      const { data: step, error: stepError } = await supabase
        .from('workflow_steps')
        .select('id, step_order, step_name')
        .eq('id', rawRequest.current_step_id)
        .single();
      
      if (stepError) {
        return {
          success: false,
          error: "لا يمكن العثور على الخطوة الحالية في مسار العمل",
          debug_info: { 
            type: "missing_step",
            step_id: rawRequest.current_step_id
          }
        };
      }
    }
    
    return {
      success: true,
      message: "مسار العمل سليم",
      debug_info: {
        request: rawRequest,
        workflow: workflow
      }
    };
  } catch (error) {
    console.error("Error in workflow debugging:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء تشخيص مسار العمل",
      debug_info: { type: "exception", message: error.message }
    };
  }
};
