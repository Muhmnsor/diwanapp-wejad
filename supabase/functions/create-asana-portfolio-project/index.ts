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
      throw new Error('Portfolio has no Asana GID')
    }

    // First get the workspace ID from the portfolio
    const portfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolio.asana_gid}`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!portfolioResponse.ok) {
      const portfolioError = await portfolioResponse.json()
      console.error('Error fetching portfolio:', portfolioError)
      throw new Error(`Failed to fetch portfolio: ${portfolioError.errors?.[0]?.message}`)
    }

    const portfolioData = await portfolioResponse.json()
    const workspaceId = portfolioData.data.workspace.gid

    console.log('Creating project in workspace:', workspaceId)

    // First create the project in the workspace
    const createProjectResponse = await fetch(`https://app.asana.com/api/1.0/projects`, {
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
          workspace: workspaceId,
          custom_fields: {
            status: project.status,
            priority: project.priority
          }
        }
      })
    })

    const projectResponse = await createProjectResponse.json()
    console.log('Project creation response:', projectResponse)

    if (!createProjectResponse.ok) {
      console.error('Error creating project:', projectResponse)
      throw new Error(`Failed to create project: ${projectResponse.errors?.[0]?.message}`)
    }

    // Now add the project to the portfolio
    const addToPortfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolio.asana_gid}/addItem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          item: projectResponse.data.gid
        }
      })
    })

    const portfolioAddResponse = await addToPortfolioResponse.json()
    console.log('Add to portfolio response:', portfolioAddResponse)

    if (!addToPortfolioResponse.ok) {
      console.error('Error adding project to portfolio:', portfolioAddResponse)
      throw new Error(`Failed to add project to portfolio: ${portfolioAddResponse.errors?.[0]?.message}`)
    }

    return new Response(
      JSON.stringify(projectResponse.data),
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