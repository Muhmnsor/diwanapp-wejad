
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
    // Initialize Supabase client with auth context from the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    );
    
    // Check if user is admin first
    const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc('is_admin');
    if (adminCheckError || !isAdmin) {
      console.error("Error checking admin status:", adminCheckError);
      return new Response(
        JSON.stringify({ success: false, message: "Only administrators can run workflow monitoring" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }
    
    console.log("Checking workflows for potential issues...");
    
    // Get all active requests
    const { data: requests, error: requestsError } = await supabaseClient
      .from('requests')
      .select('id, status, current_step_id, created_at')
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (requestsError) {
      console.error("Error fetching requests:", requestsError);
      throw requestsError;
    }
    
    console.log(`Found ${requests.length} active requests to check`);
    
    // Track results
    const results = {
      checked: requests.length,
      fixed: 0,
      errors: 0,
      details: []
    };
    
    // Process each request
    for (const request of requests) {
      try {
        // Run the fix_request_status function for each request
        const { data, error } = await supabaseClient.rpc('fix_request_status', {
          p_request_id: request.id
        });
        
        if (error) {
          console.error(`Error fixing request ${request.id}:`, error);
          results.errors++;
          results.details.push({
            request_id: request.id,
            success: false,
            error: error.message
          });
        } else if (data.fixed) {
          console.log(`Fixed request ${request.id}:`, data.fixed_issue);
          results.fixed++;
          results.details.push({
            request_id: request.id,
            success: true,
            fixed: true,
            issue: data.fixed_issue
          });
        } else {
          console.log(`Request ${request.id} is OK, no fixes needed`);
          results.details.push({
            request_id: request.id,
            success: true,
            fixed: false
          });
        }
      } catch (e) {
        console.error(`Exception processing request ${request.id}:`, e);
        results.errors++;
        results.details.push({
          request_id: request.id,
          success: false,
          error: e.message || "Unknown error"
        });
      }
    }
    
    // Return the results
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Checked ${results.checked} requests, fixed ${results.fixed} issues, encountered ${results.errors} errors`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in monitor-workflows function:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
