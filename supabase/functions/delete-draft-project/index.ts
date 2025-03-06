
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2'

// Define cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { projectId, userId } = await req.json()
    
    if (!projectId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Project ID and User ID are required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the database function to delete the draft project
    const { data, error } = await supabase
      .rpc('delete_draft_project', { 
        project_id: projectId,
        current_user_id: userId
      })

    if (error) {
      console.error('Error deleting draft project:', error)
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to delete project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Project deleted successfully' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
