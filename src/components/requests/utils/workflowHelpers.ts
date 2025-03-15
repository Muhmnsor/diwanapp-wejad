
import { supabase } from "@/integrations/supabase/client";

/**
 * Diagnoses issues with a request's workflow
 * @param requestId The ID of the request to diagnose
 * @returns Diagnosis result with any issues found
 */
export const diagnoseRequestWorkflow = async (requestId: string) => {
  try {
    // Call the diagnostic function
    const { data, error } = await supabase
      .rpc('diagnose_workflow_issues', { 
        p_request_id: requestId 
      });
    
    if (error) {
      console.error("Error diagnosing workflow:", error);
      throw error;
    }
    
    return data || { issues: [] };
  } catch (error) {
    console.error("Error in workflow diagnosis:", error);
    return { 
      success: false, 
      issues: ["حدث خطأ أثناء تشخيص مسار العمل"] 
    };
  }
};

/**
 * Updates a workflow step for a request
 */
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
    throw new Error(error instanceof Error ? error.message : "خطأ غير معروف");
  }
};

/**
 * Validates a new request before submission
 */
export const validateNewRequest = async (requestData: any) => {
  try {
    // Check if workflow is valid
    if (requestData.workflow_id) {
      const { data, error } = await supabase
        .rpc('validate_workflow', { 
          p_workflow_id: requestData.workflow_id 
        });
      
      if (error) throw error;
      
      if (!data.valid) {
        return { 
          valid: false, 
          error: data.message || "مسار العمل غير صالح", 
          requestData 
        };
      }
    }
    
    return { valid: true, requestData };
  } catch (error) {
    console.error("Error validating request:", error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "خطأ في التحقق من صحة الطلب",
      requestData
    };
  }
};
