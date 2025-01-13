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
    console.log('Fetching project details for Asana GID:', workspaceId)

    // First get the portfolio project that matches this Asana GID
    const { data: portfolioProject, error: projectError } = await supabase
      .from('portfolio_projects')
      .select(`
        id,
        portfolio:portfolios (
          id,
          name,
          description
        ),
        project:projects (
          id,
          title,
          description,
          start_date,
          end_date,
          max_attendees
        )
      `)
      .eq('asana_gid', workspaceId)
      .single()

    if (projectError) {
      console.error('Error fetching portfolio project:', projectError)
      throw projectError
    }

    if (!portfolioProject) {
      console.error('Portfolio project not found for Asana GID:', workspaceId)
      throw new Error('Portfolio project not found')
    }

    console.log('Found portfolio project:', portfolioProject)

    // Get tasks for this project
    const { data: tasks, error: tasksError } = await supabase
      .from('portfolio_tasks')
      .select(`
        *,
        assigned_to:profiles (
          email
        )
      `)
      .eq('workspace_id', portfolioProject.id)
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    // Get Asana tasks if project has Asana integration
    let asanaTasks = []
    if (workspaceId) {
      try {
        const asanaResponse = await fetch(
          `https://app.asana.com/api/1.0/projects/${workspaceId}/tasks`,
          {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('ASANA_ACCESS_TOKEN')}`,
              'Accept': 'application/json'
            }
          }
        )
        
        if (asanaResponse.ok) {
          const asanaData = await asanaResponse.json()
          asanaTasks = asanaData.data.map((task: any) => ({
            id: task.gid,
            title: task.name,
            description: task.notes,
            status: task.completed ? 'completed' : 'pending',
            due_date: task.due_on,
            gid: task.gid
          }))
          console.log('Fetched Asana tasks:', asanaTasks)
        } else {
          console.error('Error fetching Asana tasks:', await asanaResponse.text())
        }
      } catch (error) {
        console.error('Error calling Asana API:', error)
      }
    }

    // Combine response data
    const response = {
      id: portfolioProject.id,
      name: portfolioProject.project?.title || 'مشروع جديد',
      description: portfolioProject.project?.description || '',
      portfolio: portfolioProject.portfolio,
      project: portfolioProject.project,
      tasks: [...(tasks || []), ...asanaTasks]
    }

    console.log('Successfully fetched project data:', response)
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