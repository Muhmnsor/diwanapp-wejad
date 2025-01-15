import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId, asanaGid, name, description } = await req.json()

    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing ASANA_ACCESS_TOKEN')
    }

    console.log('Updating portfolio in Asana:', { portfolioId, asanaGid, name, description })

    // Update portfolio in Asana
    const response = await fetch(`https://app.asana.com/api/1.0/portfolios/${asanaGid}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name,
          description: description || '',
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Asana API error:', errorData)
      throw new Error(`Asana API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Portfolio updated in Asana:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})