import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId } = await req.json()
    console.log('Syncing portfolio projects:', portfolioId)

    // Get portfolio Asana details from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: portfolio, error: portfolioError } = await supabaseClient
      .from('portfolios')
      .select('asana_gid')
      .eq('id', portfolioId)
      .single()

    if (portfolioError) throw portfolioError

    console.log('Fetching projects from Asana workspace:', portfolio.asana_gid)

    // Fetch projects from Asana
    const response = await fetch(`https://app.asana.com/api/1.0/projects?workspace=${portfolio.asana_gid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Asana API error: ${response.statusText}`)
    }

    const asanaProjects = await response.json()
    console.log('Fetched projects from Asana:', asanaProjects)

    // Update projects in Supabase
    const { data: portfolioProjects, error: projectsError } = await supabaseClient
      .from('portfolio_projects')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (projectsError) throw projectsError

    console.log('Updating portfolio projects:', portfolioProjects)

    // Update status and priority for each project
    for (const project of portfolioProjects) {
      const asanaProject = asanaProjects.data.find(
        (p: any) => p.gid === project.asana_gid
      )
      
      if (asanaProject) {
        console.log('Updating project:', {
          id: project.id,
          status: asanaProject.status,
          priority: asanaProject.priority
        })

        await supabaseClient
          .from('portfolio_projects')
          .update({
            asana_status: asanaProject.status,
            asana_priority: asanaProject.priority
          })
          .eq('id', project.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error syncing projects:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})