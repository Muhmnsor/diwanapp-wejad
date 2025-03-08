
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError?.message || 'No user found');
      throw new Error('Unauthorized')
    }

    console.log('User ID:', user.id);

    // Check if user is admin - pass user ID to the function
    const { data: isAdmin, error: isAdminError } = await supabaseClient.rpc('is_admin', { user_id: user.id })
    
    if (isAdminError) {
      console.error('Admin check error:', isAdminError);
      throw new Error('Error checking admin privileges: ' + isAdminError.message);
    }
    
    if (!isAdmin) {
      console.error('User is not admin:', user.id);
      throw new Error('Insufficient permissions - Admin access required');
    }

    console.log('Calling generate_recurring_tasks function');
    // Call the database function to generate tasks
    const { data, error } = await supabaseClient.rpc('generate_recurring_tasks')
    
    if (error) {
      console.error('Error generating tasks:', error);
      throw error
    }

    console.log('Tasks generated successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tasksCreated: data || 0
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400 
      }
    )
  }
})
