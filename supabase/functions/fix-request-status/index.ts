
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    );
    
    // Security Enhancement: Verify user is admin before allowing this operation
    // Get the current user info
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      console.error("Error getting user data:", userError);
      return new Response(
        JSON.stringify({ success: false, message: "Authentication error: " + userError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Check if user is admin using the RPC function
    const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc('is_admin');
    if (adminCheckError) {
      console.error("Error checking admin status:", adminCheckError);
      return new Response(
        JSON.stringify({ success: false, message: "Error checking permissions: " + adminCheckError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }
    
    // If not admin, cannot perform this operation
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, message: "Only administrators can fix request status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log(`Attempting to fix status for request ${requestId}`);

    // Get the current request state for better diagnostics
    const { data: requestData, error: requestError } = await supabaseClient
      .from('requests')
      .select('status, current_step_id, workflow_id')
      .eq('id', requestId)
      .single();
      
    if (requestError) {
      console.error("Error getting request data:", requestError);
      throw requestError;
    }
    
    console.log("Current request state:", requestData);

    // Call the DB function to fix the request status
    const { data, error } = await supabaseClient.rpc('fix_request_status', {
      p_request_id: requestId
    });

    if (error) {
      console.error("Error fixing request status:", error);
      throw error;
    }

    console.log("Fix request status result:", data);
    
    // If current_step_id is not null but request is approved, verified it was set to null in the fix
    if ((requestData.status === 'approved' || requestData.status === 'completed') && requestData.current_step_id) {
      // Get the updated request state
      const { data: updatedRequestData, error: updatedRequestError } = await supabaseClient
        .from('requests')
        .select('status, current_step_id')
        .eq('id', requestId)
        .single();
        
      if (!updatedRequestError && updatedRequestData.current_step_id) {
        console.warn("Request is still marked as approved/completed but has a current_step_id.");
        console.log("Forcing removal of current_step_id for approved/completed request...");
        
        // Force removal of current_step_id
        const { data: updateResult, error: updateError } = await supabaseClient
          .from('requests')
          .update({ current_step_id: null, updated_at: new Date() })
          .eq('id', requestId)
          .or(`status.eq.approved,status.eq.completed`);
          
        if (updateError) {
          console.error("Error updating request to remove current_step_id:", updateError);
        } else {
          console.log("Successfully removed current_step_id from approved/completed request");
          data.additional_fixes = { removed_current_step_id: true };
        }
      }
    }
    
    // Additional check - if all required decision steps are approved but status is still in_progress
    if (requestData.status === 'in_progress') {
      // Check if all required decision steps are approved
      const { data: workflowData, error: workflowError } = await supabaseClient
        .from('requests')
        .select(`
          id,
          status,
          current_step_id,
          workflow_id,
          workflow_steps!workflow_id(id, step_type, is_required),
          request_approvals!inner(id, step_id, status)
        `)
        .eq('id', requestId)
        .single();
        
      if (!workflowError && workflowData) {
        console.log("Checking if all required decision steps are approved...");
        
        const requiredDecisionSteps = workflowData.workflow_steps.filter(
          (step: any) => step.step_type === 'decision' && step.is_required
        );
        
        const approvedSteps = workflowData.request_approvals.filter(
          (approval: any) => approval.status === 'approved'
        );
        
        const approvedStepIds = new Set(approvedSteps.map((a: any) => a.step_id));
        
        const allRequiredDecisionStepsApproved = requiredDecisionSteps.every(
          (step: any) => approvedStepIds.has(step.id)
        );
        
        if (allRequiredDecisionStepsApproved) {
          console.log("All required decision steps are approved, forcing completion...");
          
          const { data: updateResult, error: updateError } = await supabaseClient
            .from('requests')
            .update({ 
              status: 'approved', 
              current_step_id: null,
              updated_at: new Date()
            })
            .eq('id', requestId);
            
          if (updateError) {
            console.error("Error updating request to approved:", updateError);
          } else {
            console.log("Successfully marked request as approved");
            data.additional_fixes = { ...(data.additional_fixes || {}), forced_approval: true };
          }
        }
      }
    }
    
    // Update any 'completed' status to 'approved' to maintain consistency
    if (requestData.status === 'completed') {
      const { data: updateResult, error: updateError } = await supabaseClient
        .from('requests')
        .update({ 
          status: 'approved', 
          updated_at: new Date()
        })
        .eq('id', requestId)
        .eq('status', 'completed');
        
      if (updateError) {
        console.error("Error updating request from completed to approved:", updateError);
      } else if (updateResult) {
        console.log("Successfully updated request from completed to approved");
        data.additional_fixes = { ...(data.additional_fixes || {}), completed_to_approved: true };
      }
    }

    // Log the fix operation for audit purposes
    try {
      const { data: logData, error: logError } = await supabaseClient.from('request_approval_logs').insert({
        request_id: requestId,
        user_id: userData.user.id,
        action_type: 'fix_status',
        status: 'success',
        metadata: {
          original_state: requestData,
          fix_result: data,
          timestamp: new Date().toISOString()
        }
      });
      
      if (logError) {
        console.error("Error logging fix operation:", logError);
      }
    } catch (logError) {
      console.error("Exception logging fix operation:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Request status updated successfully", 
        data,
        original_state: requestData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fix-request-status function:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
