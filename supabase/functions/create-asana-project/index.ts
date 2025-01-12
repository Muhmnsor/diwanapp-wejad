import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
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
          start_date: startDate,
          due_date: dueDate,
          status,
          public: isPublic
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Asana API error:', error)
      throw new Error('Failed to create project in Asana')
    }

    const data = await response.json()
    console.log('Successfully created Asana project:', data)

    return new Response(
      JSON.stringify(data.data),
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