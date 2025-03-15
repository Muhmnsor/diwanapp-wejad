
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

    console.log(`Diagnosing workflow issues for request ${requestId}`);

    // Call the RPC function to diagnose the workflow
    const { data, error } = await supabaseClient.rpc('diagnose_workflow_issues', {
      p_request_id: requestId
    });

    if (error) {
      console.error("Error diagnosing workflow:", error);
      throw error;
    }

    // Also get the debug data from the debug function
    const { data: debugData, error: debugError } = await supabaseClient.rpc('debug_request_workflow', {
      request_id: requestId
    });

    if (debugError) {
      console.error("Error debugging workflow:", debugError);
    }

    console.log("Diagnose workflow result:", data);
    console.log("Debug workflow data:", debugData);

    // Combine the results
    const result = {
      diagnose: data,
      debug: debugData
    };

    return new Response(
      JSON.stringify({ success: true, data: result }),
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
