
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId } = await req.json();
    
    if (!requestId) {
      return new Response(
        JSON.stringify({ success: false, message: "Request ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client with auth context from the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    );
    
    console.log(`Diagnosing workflow issues for request ${requestId}`);

    // Get the request data
    const { data: requestData, error: requestError } = await supabaseClient
      .from('requests')
      .select('*, current_step:current_step_id(*), workflow:workflow_id(*)')
      .eq('id', requestId)
      .single();
      
    if (requestError) {
      console.error("Error fetching request data:", requestError);
      return new Response(
        JSON.stringify({ success: false, message: `Failed to fetch request data: ${requestError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Get workflow steps
    const { data: workflowSteps, error: stepsError } = await supabaseClient
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', requestData.workflow_id)
      .order('step_order', { ascending: true });
      
    if (stepsError) {
      console.error("Error fetching workflow steps:", stepsError);
      return new Response(
        JSON.stringify({ success: false, message: `Failed to fetch workflow steps: ${stepsError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Get approvals for this request
    const { data: approvals, error: approvalsError } = await supabaseClient
      .from('request_approvals')
      .select('*')
      .eq('request_id', requestId);
      
    if (approvalsError) {
      console.error("Error fetching approvals:", approvalsError);
      return new Response(
        JSON.stringify({ success: false, message: `Failed to fetch approvals: ${approvalsError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Diagnose issues
    const issues = [];
    
    // Check for invalid current step
    if (requestData.current_step_id && !workflowSteps.find(s => s.id === requestData.current_step_id)) {
      issues.push({
        severity: 'high',
        message: 'الخطوة الحالية غير موجودة في مسار سير العمل',
        code: 'INVALID_CURRENT_STEP'
      });
    }
    
    // Check for completed statuses (legacy)
    if (requestData.status === 'completed') {
      issues.push({
        severity: 'medium',
        message: 'حالة الطلب "مكتمل" يجب تحديثها إلى "تمت الموافقة"',
        code: 'LEGACY_COMPLETED_STATUS'
      });
    }
    
    // Check for requests with all steps complete but not marked approved
    const decisionSteps = workflowSteps.filter(s => s.step_type === 'decision' && s.is_required);
    const approvedDecisionStepIds = new Set(
      approvals
        .filter(a => a.status === 'approved')
        .map(a => a.step_id)
    );
    
    const allRequiredStepsApproved = decisionSteps.every(step => 
      approvedDecisionStepIds.has(step.id)
    );
    
    if (allRequiredStepsApproved && requestData.status !== 'approved' && requestData.status !== 'completed') {
      issues.push({
        severity: 'high',
        message: 'تمت الموافقة على جميع خطوات القرار المطلوبة ولكن حالة الطلب ليست "تمت الموافقة"',
        code: 'MISSING_APPROVAL_STATUS'
      });
    }
    
    // Check for approved/completed requests with current_step_id still set
    if ((requestData.status === 'approved' || requestData.status === 'completed') && requestData.current_step_id) {
      issues.push({
        severity: 'medium',
        message: 'الطلب تمت الموافقة عليه ولكن لا يزال يشير إلى خطوة حالية',
        code: 'APPROVED_WITH_CURRENT_STEP'
      });
    }
    
    // Check for requests with no current step but status is in_progress
    if (!requestData.current_step_id && requestData.status === 'in_progress') {
      issues.push({
        severity: 'high',
        message: 'الطلب في حالة قيد المعالجة ولكن لا توجد خطوة حالية محددة',
        code: 'MISSING_CURRENT_STEP'
      });
    }
    
    // Check for missing approvals for completed steps
    const expectedPreviousSteps = [];
    let foundCurrentStep = false;
    
    for (const step of workflowSteps) {
      if (step.id === requestData.current_step_id) {
        foundCurrentStep = true;
        break;
      }
      
      if (step.step_type === 'decision' && step.is_required) {
        expectedPreviousSteps.push(step);
      }
    }
    
    if (foundCurrentStep) {
      for (const step of expectedPreviousSteps) {
        if (!approvedDecisionStepIds.has(step.id)) {
          issues.push({
            severity: 'high',
            message: `خطوة سابقة مطلوبة "${step.step_name}" لم تتم الموافقة عليها`,
            code: 'MISSING_PREVIOUS_APPROVAL',
            details: { step_id: step.id, step_name: step.step_name }
          });
        }
      }
    }
    
    // Format diagnostic results
    const diagnosticData = {
      request_id: requestId,
      request_status: requestData.status,
      current_step_id: requestData.current_step_id,
      workflow_id: requestData.workflow_id,
      total_steps: workflowSteps.length,
      total_decision_steps: decisionSteps.length,
      approved_decision_steps: approvedDecisionStepIds.size,
      total_approvals: approvals.length,
      has_issues: issues.length > 0,
      issues,
      recommendations: []
    };
    
    // Provide recommendations based on issues
    if (issues.length > 0) {
      if (issues.some(i => i.code === 'LEGACY_COMPLETED_STATUS')) {
        diagnosticData.recommendations.push({
          action: 'UPDATE_STATUS',
          message: 'تحديث حالة الطلب من "مكتمل" إلى "تمت الموافقة"'
        });
      }
      
      if (issues.some(i => i.code === 'APPROVED_WITH_CURRENT_STEP')) {
        diagnosticData.recommendations.push({
          action: 'CLEAR_CURRENT_STEP',
          message: 'إزالة الإشارة إلى الخطوة الحالية للطلب المعتمد'
        });
      }
      
      if (issues.some(i => i.code === 'MISSING_APPROVAL_STATUS')) {
        diagnosticData.recommendations.push({
          action: 'SET_APPROVED_STATUS',
          message: 'تعيين حالة الطلب إلى "تمت الموافقة" نظرًا لأن جميع الخطوات المطلوبة تمت الموافقة عليها'
        });
      }
      
      // Add general recommendation to fix issues
      diagnosticData.recommendations.push({
        action: 'FIX_ALL_ISSUES',
        message: 'إصلاح جميع المشكلات المحددة باستخدام وظيفة إصلاح الحالة'
      });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: issues.length > 0 ? "تم العثور على مشكلات في سير العمل" : "لم يتم العثور على مشكلات في سير العمل",
        data: diagnosticData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in diagnose-workflow-issues function:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
