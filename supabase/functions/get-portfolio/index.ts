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
    console.log('Step 1: Received request for portfolio ID:', portfolioId)

    if (!ASANA_ACCESS_TOKEN) {
      console.error('Step 1.1: Missing ASANA_ACCESS_TOKEN')
      throw new Error('Missing ASANA_ACCESS_TOKEN')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Step 1.2: Missing Supabase configuration')
      throw new Error('Missing Supabase configuration')
    }

    // Initialize Supabase client
    console.log('Step 2: Initializing Supabase client')
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    // First get the Asana GID from our database
    console.log('Step 3: Querying database for portfolio with ID:', portfolioId)
    const { data: portfolioData, error: dbError } = await supabase
      .from('portfolio_workspaces')  // Changed from 'portfolios' to 'portfolio_workspaces'
      .select('asana_gid, name, description')
      .eq('id', portfolioId)
      .single()

    console.log('Database response:', { portfolioData, dbError })

    if (dbError) {
      console.error('Step 3.1: Database error:', dbError)
      throw new Error('خطأ في قاعدة البيانات: ' + dbError.message)
    }

    if (!portfolioData) {
      console.error('Step 3.2: No portfolio found in database')
      throw new Error('لم يتم العثور على المحفظة في قاعدة البيانات')
    }

    if (!portfolioData.asana_gid) {
      console.error('Step 3.3: Portfolio found but no Asana GID:', portfolioData)
      return new Response(
        JSON.stringify({
          name: portfolioData.name,
          description: portfolioData.description,
          items: []
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      )
    }

    const asanaGid = portfolioData.asana_gid
    console.log('Step 4: Found Asana GID:', asanaGid, 'for portfolio:', portfolioData.name)

    // Fetch portfolio details from Asana
    console.log('Step 5: Fetching portfolio details from Asana')
    const portfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${asanaGid}`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!portfolioResponse.ok) {
      const error = await portfolioResponse.json()
      console.error('Step 5.1: Asana API error:', error)
      return new Response(
        JSON.stringify({
          name: portfolioData.name,
          description: portfolioData.description,
          items: []
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      )
    }

    const asanaPortfolioData = await portfolioResponse.json()
    console.log('Step 6: Successfully fetched portfolio data from Asana:', asanaPortfolioData)

    // Fetch portfolio items (projects)
    console.log('Step 7: Fetching portfolio items from Asana')
    const itemsResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${asanaGid}/items`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!itemsResponse.ok) {
      const error = await itemsResponse.json()
      console.error('Step 7.1: Asana API error when fetching items:', error)
      return new Response(
        JSON.stringify({
          ...asanaPortfolioData.data,
          items: []
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      )
    }

    const itemsData = await itemsResponse.json()
    console.log('Step 8: Successfully fetched portfolio items:', itemsData)

    // Combine portfolio data with its items
    const portfolio = {
      ...asanaPortfolioData.data,
      items: itemsData.data
    }

    console.log('Step 9: Returning complete portfolio data:', portfolio)
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
    console.error('Error in get-portfolio function:', error.message)
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