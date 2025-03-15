
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Debug function to analyze workflow issues for a specific request
 */
export const debugWorkflowStatus = async (requestId: string) => {
  if (!requestId) {
    console.error("Request ID is required");
    return { success: false, error: "Request ID is required" };
  }

  try {
    console.log("Debugging workflow for request:", requestId);
    
    // Get request info
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select(`
        id, 
        title,
        status,
        current_step_id,
        workflow_id,
        requester_id
      `)
      .eq('id', requestId)
      .single();
      
    if (requestError) {
      console.error("Error fetching request:", requestError);
      return { success: false, error: requestError.message };
    }
    
    // Get all approvals for this request to trace its history
    const { data: approvals, error: approvalsError } = await supabase
      .from('request_approvals')
      .select(`
        id, 
        status, 
        step_id,
        approver_id,
        comments,
        approved_at,
        created_at
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
      
    if (approvalsError) {
      console.error("Error fetching approvals:", approvalsError);
    }
    
    // Get workflow steps to see the expected flow
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select(`
        id,
        step_name,
        step_type,
        step_order,
        approver_id,
        is_required
      `)
      .eq('workflow_id', request.workflow_id)
      .order('step_order', { ascending: true });
      
    if (stepsError) {
      console.error("Error fetching workflow steps:", stepsError);
    }
    
    // Analyze the flow
    const analysis = {
      request,
      steps: steps || [],
      approvals: approvals || [],
      currentStepIndex: -1,
      completedSteps: 0,
      totalRequiredSteps: 0,
      isComplete: false,
      nextExpectedStep: null,
      issues: []
    };
    
    // Count required steps
    if (steps) {
      analysis.totalRequiredSteps = steps.filter(s => s.is_required).length;
      
      // Find current step index
      if (request.current_step_id) {
        analysis.currentStepIndex = steps.findIndex(s => s.id === request.current_step_id);
      }
      
      // Find next expected step
      if (analysis.currentStepIndex >= 0 && analysis.currentStepIndex < steps.length - 1) {
        analysis.nextExpectedStep = steps[analysis.currentStepIndex + 1];
      }
    }
    
    // Count completed steps
    if (approvals) {
      analysis.completedSteps = approvals.filter(a => a.status === 'approved').length;
      
      // Check if workflow should be complete
      if (analysis.completedSteps >= analysis.totalRequiredSteps) {
        analysis.isComplete = true;
        
        if (request.status !== 'completed') {
          analysis.issues.push("All required steps are approved but request status is not 'completed'");
        }
      }
    }
    
    // Check for issues
    if (request.status === 'completed' && request.current_step_id) {
      analysis.issues.push("Request is marked as completed but still has a current step");
    }
    
    if (request.status === 'pending' && analysis.completedSteps > 0) {
      analysis.issues.push("Request has approved steps but is still in 'pending' status");
    }
    
    if (!request.workflow_id) {
      analysis.issues.push("Request has no workflow assigned");
    }
    
    console.log("Workflow analysis:", analysis);
    
    if (analysis.issues.length > 0) {
      // Try to fix common issues
      if (analysis.isComplete && request.status !== 'completed') {
        const { data: fixResult, error: fixError } = await supabase
          .rpc('fix_request_status', { 
            p_request_id: requestId 
          });
          
        if (fixError) {
          console.error("Error fixing request status:", fixError);
        } else {
          console.log("Status fix attempt result:", fixResult);
          toast.success("تم تصحيح حالة الطلب");
          
          // Reload the page after 1 second to show the changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }
    
    return {
      success: true,
      analysis,
      issues: analysis.issues,
      canFix: analysis.issues.length > 0
    };
    
  } catch (error) {
    console.error("Error in debugWorkflowStatus:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Function to manually fix a request that is stuck
 */
export const fixRequestWorkflow = async (requestId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('fix_request_status', { 
        p_request_id: requestId 
      });
      
    if (error) {
      console.error("Error fixing request:", error);
      toast.error("حدث خطأ أثناء محاولة إصلاح الطلب");
      return { success: false, error: error.message };
    }
    
    toast.success("تم إصلاح حالة الطلب بنجاح");
    return { success: true, data };
    
  } catch (error) {
    console.error("Error in fixRequestWorkflow:", error);
    toast.error("حدث خطأ أثناء محاولة إصلاح الطلب");
    return { success: false, error: error.message };
  }
};
