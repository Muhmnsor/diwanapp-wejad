import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioGid, name, description, startDate, dueDate, status, public: isPublic } = await req.json()
    console.log('Creating Asana project with data:', { portfolioGid, name, description, startDate, dueDate, status, isPublic })

    if (!ASANA_ACCESS_TOKEN) {
      console.error('Missing ASANA_ACCESS_TOKEN')
      throw new Error('Configuration error: Missing Asana access token')
    }

    if (!portfolioGid) {
      console.error('Missing portfolioGid')
      throw new Error('Portfolio GID is required')
    }

    // Create project in Asana
    const response = await fetch('https://app.asana.com/api/1.0/projects', {
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
          workspace: portfolioGid,
          start_on: startDate,
          due_on: dueDate,
          current_status: status === 'not_started' ? 'on_track' : status,
          public: isPublic === 'public'
        }
      })
    })

    const responseData = await response.json()
    console.log('Asana API response:', responseData)

    if (!response.ok) {
      console.error('Asana API error:', responseData)
      throw new Error(responseData.errors?.[0]?.message || 'Failed to create project in Asana')
    }

    // Add project to portfolio
    const addToPortfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioGid}/addItem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          item: responseData.data.gid
        }
      })
    })

    if (!addToPortfolioResponse.ok) {
      console.error('Failed to add project to portfolio:', await addToPortfolioResponse.json())
      // Don't throw here, as the project was created successfully
    }

    return new Response(
      JSON.stringify(responseData.data),
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