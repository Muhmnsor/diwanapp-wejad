
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get the request body
    const body = await req.json();
    const { requestId, currentStepId, action, metadata } = body;
    
    if (!requestId || !currentStepId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing workflow update for request ${requestId}, step ${currentStepId}, action ${action}`);
    console.log("Metadata:", metadata);
    
    // Get request information
    const { data: request, error: requestError } = await supabaseClient
      .from('requests')
      .select('*, workflow:workflow_id(*), current_step:current_step_id(*)')
      .eq('id', requestId)
      .single();
      
    if (requestError) {
      console.error("Error fetching request:", requestError);
      return new Response(
        JSON.stringify({ error: `Error fetching request: ${requestError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get workflow steps
    const { data: steps, error: stepsError } = await supabaseClient
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', request.workflow_id)
      .order('step_order', { ascending: true });
      
    if (stepsError) {
      console.error("Error fetching workflow steps:", stepsError);
      return new Response(
        JSON.stringify({ error: `Error fetching workflow steps: ${stepsError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get current step details
    const currentStep = steps.find(step => step.id === currentStepId);
    if (!currentStep) {
      return new Response(
        JSON.stringify({ error: 'Current step not found in workflow' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    let result;
    
    // Process based on action
    if (action === 'approve') {
      if (currentStep.step_type === 'opinion') {
        // For opinion steps, don't change request status, just log
        console.log("Opinion submitted. No status change required.");
        result = { success: true, message: 'تم تسجيل الرأي بنجاح', action: 'opinion_submitted' };
      } else {
        // For decision steps, update request status
        const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
        const nextStep = steps.find((step, index) => 
          index > currentStepIndex && 
          step.step_type === 'decision' && 
          step.is_required
        );
        
        if (nextStep) {
          // Move to next step
          const { data: updateData, error: updateError } = await supabaseClient
            .from('requests')
            .update({ 
              current_step_id: nextStep.id, 
              status: 'in_progress',
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select();
            
          if (updateError) {
            console.error("Error updating request to next step:", updateError);
            return new Response(
              JSON.stringify({ error: `Error updating request: ${updateError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          result = { 
            success: true, 
            message: 'تم الانتقال إلى الخطوة التالية', 
            action: 'moved_to_next_step',
            next_step: nextStep
          };
        } else {
          // No more steps, mark as approved (previously was 'completed', now 'approved')
          const { data: updateData, error: updateError } = await supabaseClient
            .from('requests')
            .update({ 
              current_step_id: null, 
              status: 'approved', // Changed from 'completed' to 'approved'
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select();
            
          if (updateError) {
            console.error("Error updating request to approved state:", updateError);
            return new Response(
              JSON.stringify({ error: `Error updating request: ${updateError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          result = { 
            success: true, 
            message: 'تمت الموافقة على الطلب بنجاح', 
            action: 'request_approved'
          };
        }
      }
    } else if (action === 'reject') {
      if (currentStep.step_type === 'opinion') {
        // For opinion steps, don't change request status
        console.log("Opinion (rejection) submitted. No status change required.");
        result = { success: true, message: 'تم تسجيل الرأي بنجاح', action: 'opinion_submitted' };
      } else {
        // For decision steps, mark as rejected
        const { data: updateData, error: updateError } = await supabaseClient
          .from('requests')
          .update({ 
            current_step_id: null, 
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .select();
          
        if (updateError) {
          console.error("Error updating request to rejected state:", updateError);
          return new Response(
            JSON.stringify({ error: `Error updating request: ${updateError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        result = { 
          success: true, 
          message: 'تم رفض الطلب', 
          action: 'request_rejected'
        };
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Log the workflow operation for audit
    const { data: logData, error: logError } = await supabaseClient.rpc(
      'log_workflow_operation',
      { 
        p_operation_type: `workflow_${action}`,
        p_request_type_id: request.request_type_id,
        p_workflow_id: request.workflow_id,
        p_step_id: currentStepId,
        p_request_data: { id: request.id, title: request.title },
        p_response_data: result,
        p_details: `Workflow update processed through edge function`
      }
    );
    
    if (logError) {
      console.warn("Warning: Could not log workflow operation:", logError);
    }
    
    // Return success response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Unexpected error in process-workflow-update:", error.message);
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
