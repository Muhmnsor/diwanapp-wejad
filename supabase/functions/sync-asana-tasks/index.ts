import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AsanaTask {
  gid: string;
  name: string;
  notes: string;
  completed: boolean;
  due_on: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Asana sync process...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaToken) {
      throw new Error('Asana access token not configured')
    }

    // First get user's workspaces
    console.log('Fetching Asana workspaces...')
    const workspacesResponse = await fetch('https://app.asana.com/api/1.0/workspaces', {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!workspacesResponse.ok) {
      const error = await workspacesResponse.text()
      console.error('Asana workspaces API error:', error)
      throw new Error(`Asana workspaces API error: ${workspacesResponse.statusText}`)
    }

    const workspaces = await workspacesResponse.json()
    console.log('Available workspaces:', workspaces)

    if (!workspaces.data || workspaces.data.length === 0) {
      throw new Error('No workspaces found in Asana account')
    }

    // Use the first workspace
    const workspaceId = workspaces.data[0].gid
    console.log(`Using workspace ID: ${workspaceId}`)

    // Fetch tasks from Asana
    console.log('Fetching tasks from Asana...')
    const tasksResponse = await fetch(`https://app.asana.com/api/1.0/tasks?workspace=${workspaceId}&assignee=me&opt_fields=gid,name,notes,completed,due_on`, {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!tasksResponse.ok) {
      const error = await tasksResponse.text()
      console.error('Asana tasks API error:', error)
      throw new Error(`Asana tasks API error: ${tasksResponse.statusText}`)
    }

    const asanaData = await tasksResponse.json()
    console.log('Fetched tasks from Asana:', asanaData)

    // Process and store tasks in Supabase
    console.log('Processing tasks...')
    const tasks = asanaData.data as AsanaTask[]
    
    for (const task of tasks) {
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

    console.log('Sync completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tasks synced successfully',
        count: tasks.length 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in sync process:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})