
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { projectId, userId } = await req.json()
    
    console.log("Received delete request for project:", projectId, "from user:", userId);
    
    if (!projectId || !userId) {
      console.error("Missing required parameters:", { projectId, userId });
      return new Response(
        JSON.stringify({ success: false, error: 'Project ID and User ID are required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Calling database function to delete draft project");
    
    // Call the database function to delete the draft project
    const { data, error } = await supabase
      .rpc('delete_draft_project', { 
        project_id: projectId,
        current_user_id: userId
      })

    if (error) {
      console.error('Error deleting draft project:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message || 'Failed to delete project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    console.log("Delete draft project result:", data);
    
    if (data !== true) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Project deleted successfully' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
