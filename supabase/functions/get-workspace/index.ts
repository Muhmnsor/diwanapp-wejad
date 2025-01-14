import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')
    
    if (!ASANA_ACCESS_TOKEN) {
      console.error('❌ Asana access token not configured')
      throw new Error('Asana access token not configured')
    }

    if (!ASANA_WORKSPACE_ID) {
      console.error('❌ Asana workspace ID not configured')
      throw new Error('Asana workspace ID not configured')
    }

    console.log('🔍 Fetching portfolios from Asana workspace:', ASANA_WORKSPACE_ID)
    
    // First get all portfolios from Asana
    console.log('🔍 Fetching Asana portfolios...')
    const portfoliosResponse = await fetch(
      `https://app.asana.com/api/1.0/workspaces/${ASANA_WORKSPACE_ID}/portfolios`, 
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!portfoliosResponse.ok) {
      const errorText = await portfoliosResponse.text()
      console.error('❌ Error fetching portfolios:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const portfoliosData = await portfoliosResponse.json()
    console.log('✅ Successfully fetched portfolios from Asana:', portfoliosData)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get existing portfolios from database
    const { data: existingPortfolios, error: dbError } = await supabase
      .from('portfolios')
      .select('*')

    if (dbError) {
      console.error('❌ Error fetching existing portfolios:', dbError)
      throw dbError
    }

    // Create a map of existing portfolios by Asana GID
    const existingPortfoliosMap = new Map(
      existingPortfolios?.map(p => [p.asana_gid, p]) || []
    )

    // Process each portfolio from Asana
    const processedPortfolios = []
    for (const portfolio of portfoliosData.data) {
      try {
        const existingPortfolio = existingPortfoliosMap.get(portfolio.gid)
        const now = new Date().toISOString()

        const portfolioData = {
          name: portfolio.name,
          description: portfolio.notes || '',
          asana_gid: portfolio.gid,
          asana_sync_enabled: true,
          sync_enabled: true,
          last_sync_at: now,
          updated_at: now
        }

        let result
        if (existingPortfolio) {
          // Update existing portfolio
          const { error: updateError } = await supabase
            .from('portfolios')
            .update(portfolioData)
            .eq('asana_gid', portfolio.gid)

          if (updateError) {
            console.error('❌ Error updating portfolio:', updateError)
            continue
          }
          result = { ...existingPortfolio, ...portfolioData }
        } else {
          // Insert new portfolio
          const { data: newPortfolio, error: insertError } = await supabase
            .from('portfolios')
            .insert({ ...portfolioData, created_at: now })
            .select()
            .single()

          if (insertError) {
            console.error('❌ Error inserting portfolio:', insertError)
            continue
          }
          result = newPortfolio
        }

        processedPortfolios.push(result)
      } catch (error) {
        console.error('❌ Error processing portfolio:', portfolio.gid, error)
        continue
      }
    }

    console.log('✅ Successfully synced portfolios:', processedPortfolios)
    return new Response(
      JSON.stringify({
        portfolios: processedPortfolios,
        details: {
          total: processedPortfolios.length,
          asana_total: portfoliosData.data.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in get-workspace function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})