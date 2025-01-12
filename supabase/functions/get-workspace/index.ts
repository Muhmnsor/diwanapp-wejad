import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { workspaceId } = await req.json()
    console.log('Fetching workspace details for ID:', workspaceId)

    // First get the workspace details
    const { data: workspace, error: workspaceError } = await supabase
      .from('portfolio_workspaces')
      .select('*')
      .eq('asana_gid', workspaceId)
      .maybeSingle()

    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError)
      throw workspaceError
    }

    if (!workspace) {
      console.error('Workspace not found for ID:', workspaceId)
      throw new Error('Workspace not found')
    }

    // Then get the tasks for this workspace
    const { data: tasks, error: tasksError } = await supabase
      .from('portfolio_tasks')
      .select(`
        *,
        assigned_to (
          email
        )
      `)
      .eq('workspace_id', workspace.id)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    const response = {
      ...workspace,
      tasks: tasks || []
    }

    console.log('Successfully fetched workspace data:', response)
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-workspace function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})