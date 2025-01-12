import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
const ASANA_CLIENT_ID = Deno.env.get('ASANA_CLIENT_ID')
const ASANA_CLIENT_SECRET = Deno.env.get('ASANA_CLIENT_SECRET')
const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, description } = await req.json()

    console.log('Creating portfolio in Asana:', { name, description })

    // Validate required environment variables
    if (!ASANA_ACCESS_TOKEN || !ASANA_WORKSPACE_ID) {
      throw new Error('Missing required environment variables')
    }

    // Create portfolio in Asana
    const asanaResponse = await fetch('https://app.asana.com/api/1.0/portfolios', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Asana-Client': ASANA_CLIENT_ID || '',
      },
      body: JSON.stringify({
        data: {
          name,
          workspace: ASANA_WORKSPACE_ID,
          description: description || '',
        },
      }),
    })

    if (!asanaResponse.ok) {
      const errorData = await asanaResponse.json()
      console.error('Asana API error:', errorData)
      throw new Error(`Asana API error: ${asanaResponse.statusText}`)
    }

    const asanaData = await asanaResponse.json()
    console.log('Asana portfolio created:', asanaData)

    return new Response(
      JSON.stringify(asanaData.data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})