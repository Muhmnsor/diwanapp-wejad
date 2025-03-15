
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Constants for environment configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RequestBody {
  requestId: string;
  currentStepId: string;
  action: "approve" | "reject" | "complete";
  metadata?: Record<string, any>;
}

serve(async (req) => {
  try {
    // Parse the request body
    const requestBody: RequestBody = await req.json();
    const { requestId, currentStepId, action, metadata = {} } = requestBody;

    console.log(`Processing action ${action} for request ${requestId}, step ${currentStepId}`);

    // Validate required inputs
    if (!requestId || !currentStepId || !action) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters"
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if the request exists
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .select(`
        id, 
        status, 
        current_step_id, 
        workflow_id,
        requester_id
      `)
      .eq("id", requestId)
      .single();

    if (requestError || !requestData) {
      console.error("Error fetching request:", requestError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request not found",
          details: requestError?.message
        }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Verify this is the current step
    if (requestData.current_step_id !== currentStepId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Provided step is not the current step for this request",
          currentStep: requestData.current_step_id
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get step information
    const { data: stepData, error: stepError } = await supabase
      .from("workflow_steps")
      .select("id, step_type, step_order, is_required")
      .eq("id", currentStepId)
      .single();

    if (stepError || !stepData) {
      console.error("Error fetching step:", stepError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Step not found",
          details: stepError?.message
        }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`Step info: type=${stepData.step_type}, required=${stepData.is_required}`);

    // Start a transaction to ensure data consistency
    let result;
    
    if (action === "approve" || (action === "complete" && stepData.step_type !== "opinion")) {
      // For approvals and completions (except opinions)
      if (stepData.step_type === "opinion") {
        console.log("Processing opinion step");
        
        // For opinion steps, we need to manually move to the next step
        // First, find the next step in the workflow
        const { data: nextStepData, error: nextStepError } = await supabase
          .from("workflow_steps")
          .select("id, step_order")
          .eq("workflow_id", requestData.workflow_id)
          .gt("step_order", stepData.step_order)
          .order("step_order", { ascending: true })
          .limit(1)
          .single();
        
        // If there's a next step, update the request to point to it
        if (nextStepData && !nextStepError) {
          console.log(`Moving to next step ${nextStepData.id} after opinion`);
          
          const { data: updateData, error: updateError } = await supabase
            .from("requests")
            .update({
              current_step_id: nextStepData.id,
              status: "in_progress",
              updated_at: new Date().toISOString()
            })
            .eq("id", requestId)
            .select();
          
          if (updateError) {
            console.error("Error updating request after opinion:", updateError);
            result = {
              success: false,
              error: "Failed to process next step after opinion",
              details: updateError.message
            };
          } else {
            result = {
              success: true,
              message: "Opinion recorded and moved to next step",
              nextStep: nextStepData.id,
              data: updateData
            };
          }
        } else if (nextStepError?.code === "PGRST116") {
          // No next step found, this was the last step
          console.log("No next step found after opinion, completing request");
          
          const { data: completeData, error: completeError } = await supabase
            .from("requests")
            .update({
              current_step_id: null,
              status: "completed",
              updated_at: new Date().toISOString()
            })
            .eq("id", requestId)
            .select();
          
          if (completeError) {
            console.error("Error completing request after opinion:", completeError);
            result = {
              success: false,
              error: "Failed to complete request after opinion",
              details: completeError.message
            };
          } else {
            result = {
              success: true,
              message: "Opinion recorded and request completed",
              data: completeData
            };
          }
        } else {
          console.error("Error finding next step:", nextStepError);
          result = {
            success: false,
            error: "Failed to find next step",
            details: nextStepError?.message
          };
        }
      } else {
        // For decision steps, use the RPC function
        console.log("Processing approval/completion for decision step");
        
        const { data: rpcData, error: rpcError } = await supabase
          .rpc("update_request_after_approval", {
            p_request_id: requestId,
            p_step_id: currentStepId
          });
        
        if (rpcError) {
          console.error("Error in RPC call:", rpcError);
          result = {
            success: false,
            error: "Failed to process workflow step",
            details: rpcError.message
          };
        } else {
          result = {
            success: true,
            message: "Workflow step processed successfully",
            data: rpcData
          };
        }
      }
    } else if (action === "reject" && stepData.step_type !== "opinion") {
      // Handle rejection for decision steps
      console.log("Processing rejection for decision step");
      
      // For rejections of decision steps, mark the request as rejected
      const { data: rejectData, error: rejectError } = await supabase
        .from("requests")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId)
        .select();
      
      if (rejectError) {
        console.error("Error rejecting request:", rejectError);
        result = {
          success: false,
          error: "Failed to reject request",
          details: rejectError.message
        };
      } else {
        result = {
          success: true,
          message: "Request rejected successfully",
          data: rejectData
        };
      }
    } else if (action === "reject" && stepData.step_type === "opinion") {
      // For opinions, rejection is just recording the opinion - move to next step
      console.log("Processing opinion with negative feedback");
      
      // Find the next step in the workflow
      const { data: nextStepData, error: nextStepError } = await supabase
        .from("workflow_steps")
        .select("id, step_order")
        .eq("workflow_id", requestData.workflow_id)
        .gt("step_order", stepData.step_order)
        .order("step_order", { ascending: true })
        .limit(1)
        .single();
      
      // If there's a next step, update the request to point to it
      if (nextStepData && !nextStepError) {
        console.log(`Moving to next step ${nextStepData.id} after negative opinion`);
        
        const { data: updateData, error: updateError } = await supabase
          .from("requests")
          .update({
            current_step_id: nextStepData.id,
            status: "in_progress",
            updated_at: new Date().toISOString()
          })
          .eq("id", requestId)
          .select();
        
        if (updateError) {
          console.error("Error updating request after negative opinion:", updateError);
          result = {
            success: false,
            error: "Failed to process next step after negative opinion",
            details: updateError.message
          };
        } else {
          result = {
            success: true,
            message: "Negative opinion recorded and moved to next step",
            nextStep: nextStepData.id,
            data: updateData
          };
        }
      } else if (nextStepError?.code === "PGRST116") {
        // No next step found, this was the last step
        console.log("No next step found after negative opinion, completing request");
        
        const { data: completeData, error: completeError } = await supabase
          .from("requests")
          .update({
            current_step_id: null,
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", requestId)
          .select();
        
        if (completeError) {
          console.error("Error completing request after negative opinion:", completeError);
          result = {
            success: false,
            error: "Failed to complete request after negative opinion",
            details: completeError.message
          };
        } else {
          result = {
            success: true,
            message: "Negative opinion recorded and request completed",
            data: completeData
          };
        }
      } else {
        console.error("Error finding next step after negative opinion:", nextStepError);
        result = {
          success: false,
          error: "Failed to find next step after negative opinion",
          details: nextStepError?.message
        };
      }
    } else {
      result = {
        success: false,
        error: `Invalid action '${action}' for step type '${stepData.step_type}'`
      };
    }

    // Log the operation
    const { error: logError } = await supabase
      .from("request_workflow_operation_logs")
      .insert({
        user_id: metadata.userId || null,
        operation_type: `${action}_step`,
        request_type_id: null,
        workflow_id: requestData.workflow_id,
        step_id: currentStepId,
        details: `Action: ${action}, Step type: ${stepData.step_type}`,
        request_data: { requestId, stepId: currentStepId },
        response_data: result
      });

    if (logError) {
      console.error("Error logging operation:", logError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { "Content-Type": "application/json" }, status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error.message
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
