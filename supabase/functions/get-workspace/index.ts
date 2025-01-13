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
    console.log('Fetching Asana project details for GID:', workspaceId)

    // First try to get the Asana project details
    try {
      const asanaResponse = await fetch(
        `https://app.asana.com/api/1.0/projects/${workspaceId}`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('ASANA_ACCESS_TOKEN')}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!asanaResponse.ok) {
        throw new Error('Failed to fetch Asana project')
      }

      const asanaProject = await asanaResponse.json()
      console.log('Fetched Asana project:', asanaProject.data)

      // Get or create portfolio project mapping
      let { data: portfolioProject, error: projectError } = await supabase
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

      if (projectError || !portfolioProject) {
        console.log('Portfolio project not found, creating new mapping...')
        
        // Create new project
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert({
            title: asanaProject.data.name,
            description: asanaProject.data.notes || '',
            start_date: new Date().toISOString(),
            end_date: asanaProject.data.due_on || new Date().toISOString(),
            max_attendees: 0,
            image_url: '/placeholder.svg',
            event_type: 'in-person',
            beneficiary_type: 'both',
            event_path: 'environment',
            event_category: 'social'
          })
          .select()
          .single()

        if (createError) throw createError

        // Create portfolio project mapping
        const { data: newPortfolioProject, error: mappingError } = await supabase
          .from('portfolio_projects')
          .insert({
            project_id: newProject.id,
            asana_gid: workspaceId
          })
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
          .single()

        if (mappingError) throw mappingError
        portfolioProject = newPortfolioProject
      }

      // Get tasks from Asana
      const tasksResponse = await fetch(
        `https://app.asana.com/api/1.0/projects/${workspaceId}/tasks`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('ASANA_ACCESS_TOKEN')}`,
            'Accept': 'application/json'
          }
        }
      )

      let asanaTasks = []
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        asanaTasks = tasksData.data.map((task: any) => ({
          id: task.gid,
          title: task.name,
          description: task.notes,
          status: task.completed ? 'completed' : 'pending',
          due_date: task.due_on,
          gid: task.gid
        }))
        console.log('Fetched Asana tasks:', asanaTasks)
      }

      // Get local tasks
      const { data: localTasks, error: tasksError } = await supabase
        .from('portfolio_tasks')
        .select(`
          *,
          assigned_to:profiles (
            email
          )
        `)
        .eq('workspace_id', portfolioProject.id)

      if (tasksError) throw tasksError

      // Combine response data
      const response = {
        id: portfolioProject.id,
        name: portfolioProject.project?.title || asanaProject.data.name,
        description: portfolioProject.project?.description || asanaProject.data.notes || '',
        portfolio: portfolioProject.portfolio,
        project: portfolioProject.project,
        tasks: [...(localTasks || []), ...asanaTasks]
      }

      console.log('Successfully prepared response:', response)
      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (asanaError) {
      console.error('Error with Asana:', asanaError)
      throw asanaError
    }

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