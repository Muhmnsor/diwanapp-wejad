
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    
    // If current_step_id is not null but request is completed,
    // verify it was set to null in the fix
    if (requestData.status === 'completed' && requestData.current_step_id) {
      // Get the updated request state
      const { data: updatedRequestData, error: updatedRequestError } = await supabaseClient
        .from('requests')
        .select('status, current_step_id')
        .eq('id', requestId)
        .single();
        
      if (!updatedRequestError && updatedRequestData.current_step_id) {
        console.warn("Request is still marked as completed but has a current_step_id.");
        console.log("Forcing removal of current_step_id for completed request...");
        
        // Force removal of current_step_id
        const { data: updateResult, error: updateError } = await supabaseClient
          .from('requests')
          .update({ current_step_id: null, updated_at: new Date() })
          .eq('id', requestId)
          .eq('status', 'completed');
          
        if (updateError) {
          console.error("Error updating request to remove current_step_id:", updateError);
        } else {
          console.log("Successfully removed current_step_id from completed request");
          data.additional_fixes = { removed_current_step_id: true };
        }
      }
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
