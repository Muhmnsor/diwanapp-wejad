import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioGid, folderGid, name, description, startDate, dueDate, status, public: isPublic } = await req.json()
    console.log('Creating Asana project with data:', { portfolioGid, folderGid, name, description, startDate, dueDate, status, isPublic })

    if (!ASANA_ACCESS_TOKEN) {
      console.error('Missing ASANA_ACCESS_TOKEN')
      throw new Error('Configuration error: Missing Asana access token')
    }

    if (!portfolioGid) {
      console.error('Missing portfolioGid')
      throw new Error('Portfolio GID is required')
    }

    // Create project in Asana
    const createProjectResponse = await fetch('https://app.asana.com/api/1.0/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name,
          notes: description,
          start_on: startDate,
          due_on: dueDate,
          public: isPublic,
          archived: false,
          color: 'light-green',
          workspace: portfolioGid
        }
      })
    });

    if (!createProjectResponse.ok) {
      const error = await createProjectResponse.json()
      console.error('Failed to create Asana project:', error)
      throw new Error('Failed to create project in Asana')
    }

    const projectData = await createProjectResponse.json()
    const projectGid = projectData.data.gid

    console.log('Successfully created Asana project:', projectData)

    // Add project to portfolio
    const addToPortfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioGid}/addItem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          item: projectGid
        }
      })
    })

    if (!addToPortfolioResponse.ok) {
      const error = await addToPortfolioResponse.json()
      console.error('Failed to add project to portfolio:', error)
      throw new Error('Failed to add project to portfolio')
    }

    // If folder GID is provided, add project to folder
    if (folderGid) {
      const addToFolderResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${folderGid}/addItem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: {
            item: projectGid
          }
        })
      })

      if (!addToFolderResponse.ok) {
        console.error('Failed to add project to folder:', await addToFolderResponse.json())
        // Don't throw here, just log the error as this is optional
      }
    }

    return new Response(
      JSON.stringify({ gid: projectGid }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in create-asana-project function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})