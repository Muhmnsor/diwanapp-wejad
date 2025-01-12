import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId } = await req.json()
    console.log('Fetching portfolio from Asana:', portfolioId)

    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing ASANA_ACCESS_TOKEN')
    }

    // Fetch portfolio details from Asana
    const portfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioId}`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!portfolioResponse.ok) {
      const error = await portfolioResponse.json()
      console.error('Asana API error:', error)
      throw new Error(`Asana API error: ${portfolioResponse.statusText}`)
    }

    const portfolioData = await portfolioResponse.json()
    console.log('Portfolio data from Asana:', portfolioData)

    // Fetch portfolio items (projects)
    const itemsResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioId}/items`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!itemsResponse.ok) {
      const error = await itemsResponse.json()
      console.error('Asana API error when fetching items:', error)
      throw new Error(`Asana API error: ${itemsResponse.statusText}`)
    }

    const itemsData = await itemsResponse.json()
    console.log('Portfolio items from Asana:', itemsData)

    // Combine portfolio data with its items
    const portfolio = {
      ...portfolioData.data,
      items: itemsData.data
    }

    return new Response(
      JSON.stringify(portfolio),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
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