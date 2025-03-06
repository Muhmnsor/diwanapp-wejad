
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    // Validate environment variables before proceeding
    if (!supabaseUrl) {
      console.error("SUPABASE_URL environment variable is not set");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing SUPABASE_URL' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }
    
    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }
    
    console.log("Creating Supabase client with URL:", supabaseUrl);
    // Not logging the actual key for security reasons, but checking if it looks reasonable
    console.log("Service key appears to be set:", !!supabaseServiceKey, "Length:", supabaseServiceKey.length);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Calling database function to delete draft project with parameters:", { 
      p_project_id: projectId, 
      p_user_id: userId 
    });
    
    // Call the database function with the correct parameter names
    const { data, error } = await supabase
      .rpc('delete_draft_project', { 
        p_project_id: projectId,
        p_user_id: userId
      })

    if (error) {
      console.error('Error deleting draft project:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'Failed to delete project',
          details: error
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    console.log("Delete draft project result:", data);
    
    if (data !== true) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to delete project',
          result: data 
        }),
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
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
