
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.2";

// Configure Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { requestId, currentStepId, action, metadata } = body;

    console.log(`Processing workflow update for request: ${requestId}, step: ${currentStepId}, action: ${action}`);

    if (!requestId || !currentStepId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters: requestId and currentStepId are required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get the current request data to understand the workflow state
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .select("*, workflow:workflow_id(*)")
      .eq("id", requestId)
      .single();

    if (requestError) {
      console.error("Error fetching request data:", requestError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch request data: ${requestError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Get the workflow steps to identify the next step - CRITICALLY IMPORTANT TO ORDER BY step_order
    const { data: workflowSteps, error: stepsError } = await supabase
      .from("workflow_steps")
      .select("*")
      .eq("workflow_id", requestData.workflow_id)
      .order("step_order", { ascending: true });

    if (stepsError) {
      console.error("Error fetching workflow steps:", stepsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch workflow steps: ${stepsError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Find the current step and its index
    const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStepId);
    if (currentStepIndex === -1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Current step not found in workflow",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const currentStep = workflowSteps[currentStepIndex];
    console.log("Current step:", currentStep);
    
    // Get the approvals for this request
    const { data: approvals, error: approvalsError } = await supabase
      .from("request_approvals")
      .select("*")
      .eq("request_id", requestId);
      
    if (approvalsError) {
      console.error("Error fetching approvals:", approvalsError);
      // Continue despite this error
    }
    
    console.log("Current approvals:", approvals || []);
    
    // For opinion steps, we need to move to the next step regardless of approval or rejection
    // For decision steps, we only move to the next step on approval
    let shouldMoveToNextStep = false;
    let isLastStep = false;
    
    // For opinion steps - only move to next step once ALL opinions have been collected
    if (currentStep.step_type === "opinion") {
      console.log("This is an opinion step");
      
      // Check if all required opinions have been collected
      // For multiple opinions at same step (different users), ensure we have them all
      const requiredApprovers = workflowSteps
        .filter(step => step.step_order === currentStep.step_order)
        .map(step => step.approver_id);
        
      console.log("Required approvers for this opinion step:", requiredApprovers);
      
      // Check if we have opinions from all required approvers
      const hasAllOpinions = requiredApprovers.every(approverId => {
        return approvals?.some(approval => 
          approval.step_id === currentStepId && 
          approval.approver_id === approverId
        );
      });
      
      console.log("Have all required opinions:", hasAllOpinions);
      
      // If we have all required opinions, move to next step
      if (hasAllOpinions) {
        shouldMoveToNextStep = true;
      } else {
        console.log("Waiting for additional opinions before moving to next step");
        shouldMoveToNextStep = false;
      }
    } else if (action === "approve" && currentStep.step_type === "decision") {
      console.log("This is an approved decision step, moving to next step");
      shouldMoveToNextStep = true;
    }

    // Only attempt to find the next step if we should move to next step
    let nextStep = null;
    if (shouldMoveToNextStep) {
      // Get the current step_order to find the next step
      const currentStepOrder = currentStep.step_order;
      console.log("Current step order:", currentStepOrder);
      
      // Find next available step with a higher step_order
      const nextSteps = workflowSteps
        .filter(step => step.step_order > currentStepOrder)
        .sort((a, b) => a.step_order - b.step_order);
      
      if (nextSteps.length > 0) {
        // Get the next step_order value
        const nextStepOrder = nextSteps[0].step_order;
        console.log("Next step order:", nextStepOrder);
        
        // Get all steps at this order (could be multiple in parallel)
        const nextOrderSteps = workflowSteps.filter(step => 
          step.step_order === nextStepOrder
        );
        
        // For now, just take the first one
        nextStep = nextOrderSteps[0];
        console.log("Moving to step:", nextStep);
      }
      
      if (!nextStep) {
        console.log("No next step found, this is the last step");
        isLastStep = true;
      }
    }

    // Update the request status and current step
    const updateData: any = {};
    
    if (shouldMoveToNextStep) {
      if (isLastStep) {
        // If this is the last step and it's approved, mark the request as completed
        if (action === "approve") {
          updateData.status = "completed";
          updateData.current_step_id = null;
        } 
        // If it's rejected, keep the status as is but don't change the step
      } else if (nextStep) {
        // Move to the next step
        updateData.current_step_id = nextStep.id;
        updateData.status = "in_progress";
      }
    } else if (action === "reject" && currentStep.step_type === "decision") {
      // For rejected decision steps, mark the request as rejected
      updateData.status = "rejected";
      updateData.current_step_id = null;
    }

    // Only update if we have changes to make
    if (Object.keys(updateData).length > 0) {
      console.log("Updating request with:", updateData);
      
      const { data: updateResult, error: updateError } = await supabase
        .from("requests")
        .update(updateData)
        .eq("id", requestId)
        .select();

      if (updateError) {
        console.error("Error updating request:", updateError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to update request: ${updateError.message}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      // Log the workflow update for auditing
      const { error: logError } = await supabase
        .from("request_approval_logs")
        .insert({
          request_id: requestId,
          step_id: currentStepId,
          user_id: metadata?.userId || null,
          action_type: `workflow_${action}`,
          status: "success",
          metadata: {
            previous_status: requestData.status,
            new_status: updateData.status || requestData.status,
            previous_step_id: currentStepId,
            new_step_id: updateData.current_step_id || null,
            is_last_step: isLastStep,
            timestamp: new Date().toISOString(),
            client_metadata: metadata || {}
          }
        });

      if (logError) {
        console.error("Error logging workflow update:", logError);
        // Continue despite log error - this shouldn't fail the operation
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Workflow updated successfully",
          data: {
            requestId,
            previousStepId: currentStepId,
            nextStepId: updateData.current_step_id,
            status: updateData.status || requestData.status,
            isLastStep
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // No updates were needed
      console.log("No updates needed for the request");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No workflow updates were needed",
          data: {
            requestId,
            currentStepId,
            status: requestData.status,
            noChangesRequired: true
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in process-workflow-update:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Unhandled error: ${error.message || "Unknown error"}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
