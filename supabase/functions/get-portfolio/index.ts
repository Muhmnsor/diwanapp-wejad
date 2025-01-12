import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId } = await req.json()
    console.log('Processing portfolio request for ID:', portfolioId)

    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing ASANA_ACCESS_TOKEN')
    }

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // First get the Asana GID from our database
    const { data: portfolioData, error: dbError } = await supabase
      .from('portfolios')
      .select('asana_gid')
      .eq('id', portfolioId)
      .single()

    if (dbError || !portfolioData?.asana_gid) {
      console.error('Database error or no Asana GID found:', dbError)
      throw new Error('Portfolio not found or no Asana ID available')
    }

    const asanaGid = portfolioData.asana_gid
    console.log('Found Asana GID:', asanaGid)

    // Fetch portfolio details from Asana
    const portfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${asanaGid}`, {
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

    const asanaPortfolioData = await portfolioResponse.json()
    console.log('Portfolio data from Asana:', asanaPortfolioData)

    // Fetch portfolio items (projects)
    const itemsResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${asanaGid}/items`, {
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
      ...asanaPortfolioData.data,
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