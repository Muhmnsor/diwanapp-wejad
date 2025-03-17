
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
    console.log("Diagnosing workflow issues for request:", requestId);
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

// Debug workflow status
export const debugWorkflowStatus = async (requestId: string) => {
  try {
    console.log("Debugging workflow status for request:", requestId);
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select('*, current_step:current_step_id(*), workflow:workflow_id(*)')
      .eq('id', requestId)
      .single();
      
    if (requestError) throw requestError;
    
    // Get workflow steps
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', requestData.workflow_id)
      .order('step_order', { ascending: true });
      
    if (stepsError) throw stepsError;
    
    // Get approvals for this request
    const { data: approvals, error: approvalsError } = await supabase
      .from('request_approvals')
      .select('*')
      .eq('request_id', requestId);
      
    if (approvalsError) throw approvalsError;
    
    // Calculate expected workflow state
    const issues = [];
    
    // Check if current step matches an actual step in the workflow
    if (requestData.current_step_id && !steps.find(s => s.id === requestData.current_step_id)) {
      issues.push('الخطوة الحالية غير موجودة في مسار سير العمل');
    }
    
    // Check completed steps vs. current step
    const decisionSteps = steps.filter(s => s.step_type === 'decision');
    const approvedDecisionSteps = approvals.filter(a => 
      a.status === 'approved' && 
      steps.find(s => s.id === a.step_id && s.step_type === 'decision')
    );
    
    // Check for completed requests without all required steps approved
    if (requestData.status === 'completed' && approvedDecisionSteps.length < decisionSteps.length) {
      issues.push('الطلب مكتمل ولكن لم يتم الموافقة على جميع خطوات القرار المطلوبة');
    }
    
    // Check for pending/in_progress requests with all required steps approved
    if ((requestData.status === 'pending' || requestData.status === 'in_progress') && 
        approvedDecisionSteps.length >= decisionSteps.length) {
      issues.push('تمت الموافقة على جميع خطوات القرار ولكن الطلب لم يتم تحديثه إلى حالة مكتمل');
    }
    
    // Check if current step is after all approved steps
    if (requestData.current_step_id) {
      const currentStep = steps.find(s => s.id === requestData.current_step_id);
      if (currentStep) {
        const currentStepIndex = steps.findIndex(s => s.id === requestData.current_step_id);
        const lastApprovedStepIndex = steps.reduce((maxIndex, step, index) => {
          const isApproved = approvals.some(a => a.step_id === step.id && a.status === 'approved');
          return isApproved && index > maxIndex ? index : maxIndex;
        }, -1);
        
        if (lastApprovedStepIndex >= currentStepIndex && currentStep.step_type === 'decision') {
          issues.push('الخطوة الحالية تأتي بعد خطوات تمت الموافقة عليها بالفعل');
        }
      }
    }
    
    // Check for specific issues with opinion steps
    const opinionSteps = steps.filter(s => s.step_type === 'opinion');
    if (opinionSteps.length > 0) {
      // Check if workflow is stuck at an opinion step
      if (requestData.current_step_id) {
        const currentStep = steps.find(s => s.id === requestData.current_step_id);
        if (currentStep?.step_type === 'opinion') {
          // Check if all approvers have already submitted opinions
          const relevantApprovals = approvals.filter(a => a.step_id === requestData.current_step_id);
          if (relevantApprovals.length > 0) {
            issues.push('الطلب متوقف عند خطوة رأي على الرغم من وجود آراء مقدمة بالفعل');
          }
        }
      }
    }
    
    // Check for missing current_step_id in non-completed requests
    if (requestData.status !== 'completed' && !requestData.current_step_id) {
      issues.push('الطلب غير مكتمل ولكن لا توجد خطوة حالية محددة');
    }
    
    return {
      success: true,
      issues,
      status: requestData.status,
      current_step_id: requestData.current_step_id,
      workflow_id: requestData.workflow_id,
      debug_info: {
        request: requestData,
        steps: steps,
        approvals: approvals,
        approved_decision_steps: approvedDecisionSteps.length,
        total_decision_steps: decisionSteps.length,
        opinion_steps: opinionSteps.length
      }
    };
  } catch (error) {
    console.error("Error debugging workflow status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ أثناء تشخيص حالة مسار العمل"
    };
  }
};

// Fix workflow issues
export const fixRequestWorkflow = async (requestId: string) => {
  try {
    console.log("Fixing workflow for request:", requestId);
    const { data, error } = await supabase.rpc('fix_request_status', {
      p_request_id: requestId
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fixing workflow:", error);
    throw error;
  }
};
