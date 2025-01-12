import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId, project } = await req.json()
    console.log('Received request to create project:', { portfolioId, project })

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

    if (portfolioError) {
      console.error('Error fetching portfolio:', portfolioError)
      throw portfolioError
    }

    if (!portfolio.asana_gid) {
      throw new Error('Portfolio has no Asana workspace ID')
    }

    console.log('Creating project in Asana:', {
      portfolioId,
      workspaceGid: portfolio.asana_gid,
      project
    })

    // First create the project in Asana workspace
    const createResponse = await fetch('https://app.asana.com/api/1.0/workspaces/' + portfolio.asana_gid + '/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: project.title,
          notes: project.description,
          due_date: project.dueDate,
          start_date: project.startDate,
          owner: 'me'
        }
      })
    })

    const asanaProject = await createResponse.json()

    if (!createResponse.ok) {
      console.error('Asana API error:', asanaProject)
      throw new Error(`Asana API error: ${createResponse.statusText || asanaProject.errors?.[0]?.message || 'Unknown error'}`)
    }

    console.log('Project created in Asana:', asanaProject)

    // Now update the project with custom fields
    const updateResponse = await fetch(`https://app.asana.com/api/1.0/projects/${asanaProject.data.gid}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          custom_fields: {
            status: project.status,
            priority: project.priority
          }
        }
      })
    })

    if (!updateResponse.ok) {
      console.error('Failed to update project custom fields:', await updateResponse.json())
    }

    return new Response(
      JSON.stringify(asanaProject.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error creating project:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})