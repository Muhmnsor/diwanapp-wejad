import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaToken) {
      throw new Error('Asana access token not configured')
    }

    // Fetch tasks from Asana
    const asanaResponse = await fetch('https://app.asana.com/api/1.0/tasks?workspace=1205738783059671&assignee=me', {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!asanaResponse.ok) {
      throw new Error(`Asana API error: ${asanaResponse.statusText}`)
    }

    const asanaData = await asanaResponse.json()
    console.log('Fetched tasks from Asana:', asanaData)

    // Process and store tasks in Supabase
    for (const task of asanaData.data) {
      const { data, error } = await supabaseClient
        .from('tasks')
        .upsert({
          title: task.name,
          description: task.notes,
          status: task.completed ? 'completed' : 'pending',
          due_date: task.due_on,
          asana_gid: task.gid
        }, {
          onConflict: 'asana_gid'
        })

      if (error) {
        console.error('Error storing task:', error)
        throw error
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Tasks synced successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})