import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId, project } = await req.json()
    console.log('Creating project in portfolio:', { portfolioId, project })

    // First get portfolio details from Asana to get workspace info
    console.log('Fetching portfolio details from Asana:', portfolioId)
    const portfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioId}`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!portfolioResponse.ok) {
      const portfolioError = await portfolioResponse.json()
      console.error('Error fetching Asana portfolio:', portfolioError)
      throw new Error(`Failed to fetch Asana portfolio: ${portfolioError.errors?.[0]?.message}`)
    }

    const portfolioData = await portfolioResponse.json()
    const workspaceId = portfolioData.data.workspace.gid
    console.log('Got workspace ID:', workspaceId)

    // Get the team ID from the workspace
    console.log('Fetching teams for workspace:', workspaceId)
    const teamsResponse = await fetch(`https://app.asana.com/api/1.0/workspaces/${workspaceId}/teams`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!teamsResponse.ok) {
      const teamsError = await teamsResponse.json()
      console.error('Error fetching teams:', teamsError)
      throw new Error(`Failed to fetch teams: ${teamsError.errors?.[0]?.message}`)
    }

    const teamsData = await teamsResponse.json()
    if (!teamsData.data?.length) {
      throw new Error('No teams found in workspace')
    }

    const teamId = teamsData.data[0].gid // Use the first team
    console.log('Using team ID:', teamId)

    // Create project in Asana workspace
    console.log('Creating project in Asana workspace:', workspaceId)
    const createProjectResponse = await fetch('https://app.asana.com/api/1.0/projects', {
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
          team: teamId
        }
      })
    })

    const projectData = await createProjectResponse.json()
    console.log('Asana project creation response:', projectData)

    if (!createProjectResponse.ok) {
      console.error('Error creating Asana project:', projectData)
      throw new Error(`Failed to create Asana project: ${projectData.errors?.[0]?.message}`)
    }

    // Add project to portfolio
    console.log('Adding project to portfolio:', portfolioId)
    const addToPortfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioId}/addItem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          item: projectData.data.gid
        }
      })
    })

    const portfolioAddData = await addToPortfolioResponse.json()
    console.log('Add to portfolio response:', portfolioAddData)

    if (!addToPortfolioResponse.ok) {
      console.error('Error adding project to portfolio:', portfolioAddData)
      throw new Error(`Failed to add project to portfolio: ${portfolioAddData.errors?.[0]?.message}`)
    }

    // Update project status and priority if provided
    if (project.status || project.priority) {
      console.log('Updating project custom fields:', { status: project.status, priority: project.priority })
      const updateResponse = await fetch(`https://app.asana.com/api/1.0/projects/${projectData.data.gid}`, {
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
        console.warn('Warning: Failed to update project custom fields:', await updateResponse.json())
      }
    }

    return new Response(
      JSON.stringify(projectData.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in create-asana-portfolio-project:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})