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
      .select(`
        *,
        portfolio_projects!inner (
          *,
          projects (*)
        )
      `)
      .eq('asana_gid', workspaceId)
      .maybeSingle()

    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError)
      throw workspaceError
    }

    if (!workspace) {
      console.error('Workspace not found for ID:', workspaceId)
      return new Response(
        JSON.stringify({ 
          name: 'مساحة عمل جديدة',
          description: '',
          tasks: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Get tasks for this workspace with assigned user information
    const { data: tasks, error: tasksError } = await supabase
      .from('portfolio_tasks')
      .select(`
        *,
        profiles:assigned_to (
          email
        )
      `)
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    // Transform tasks to include assignee info
    const transformedTasks = tasks?.map(task => ({
      ...task,
      assigned_to: task.profiles
    })) || []

    // Get Asana tasks if project has Asana integration
    let asanaTasks = []
    if (workspace.portfolio_projects?.[0]?.asana_gid) {
      const asanaResponse = await fetch(
        `https://app.asana.com/api/1.0/projects/${workspace.portfolio_projects[0].asana_gid}/tasks`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('ASANA_ACCESS_TOKEN')}`,
            'Accept': 'application/json'
          }
        }
      )
      
      if (asanaResponse.ok) {
        const asanaData = await asanaResponse.json()
        asanaTasks = asanaData.data
        console.log('Fetched Asana tasks:', asanaTasks)
      }
    }

    // Combine response data
    const response = {
      ...workspace,
      project: workspace.portfolio_projects?.[0]?.projects || null,
      tasks: [...transformedTasks, ...asanaTasks]
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