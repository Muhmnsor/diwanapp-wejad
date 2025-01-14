import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url, options)
    if (!response.ok && retries > 0) {
      console.log(`Retrying request, ${retries} attempts remaining`)
      await sleep(RETRY_DELAY)
      return fetchWithRetry(url, options, retries - 1)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying... ${retries} attempts remaining`)
      await sleep(RETRY_DELAY)
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!ASANA_ACCESS_TOKEN || !ASANA_WORKSPACE_ID) {
      console.error('❌ Missing required environment variables')
      throw new Error('Missing required environment variables')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase configuration')
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    console.log('🔍 Fetching portfolios from Asana workspace:', ASANA_WORKSPACE_ID)

    // First get user info to use as owner
    const userResponse = await fetchWithRetry(
      'https://app.asana.com/api/1.0/users/me',
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('❌ Error fetching user info from Asana:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const userData = await userResponse.json()
    const userId = userData.data.gid
    
    // Get portfolios from Asana with retry mechanism and owner parameter
    const asanaResponse = await fetchWithRetry(
      `https://app.asana.com/api/1.0/workspaces/${ASANA_WORKSPACE_ID}/portfolios?owner=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!asanaResponse.ok) {
      const errorText = await asanaResponse.text()
      console.error('❌ Error fetching portfolios from Asana:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const asanaData = await asanaResponse.json()
    console.log('✅ Successfully fetched portfolios from Asana:', asanaData)

    // Get existing portfolios from database
    const { data: existingPortfolios, error: dbError } = await supabase
      .from('portfolios')
      .select('*')

    if (dbError) {
      console.error('❌ Error fetching existing portfolios:', dbError)
      throw dbError
    }

    // Create maps for efficient lookup
    const existingPortfoliosMap = new Map(
      existingPortfolios?.map(p => [p.asana_gid, p]) || []
    )
    const asanaPortfoliosMap = new Map(
      asanaData.data?.map(p => [p.gid, p]) || []
    )

    const processedPortfolios = []
    const now = new Date().toISOString()

    // Process portfolios from Asana
    for (const portfolio of asanaData.data || []) {
      try {
        const existingPortfolio = existingPortfoliosMap.get(portfolio.gid)
        
        const portfolioData = {
          name: portfolio.name,
          description: portfolio.notes || '',
          asana_gid: portfolio.gid,
          asana_sync_enabled: true,
          sync_enabled: true,
          last_sync_at: now,
          updated_at: now,
          sync_error: null // Clear any previous errors
        }

        let result
        if (existingPortfolio) {
          console.log('📝 Updating existing portfolio:', portfolioData)
          const { data: updatedPortfolio, error: updateError } = await supabase
            .from('portfolios')
            .update(portfolioData)
            .eq('asana_gid', portfolio.gid)
            .select()
            .single()

          if (updateError) {
            console.error('❌ Error updating portfolio:', updateError)
            continue
          }
          result = updatedPortfolio
        } else {
          console.log('📝 Creating new portfolio from Asana:', portfolioData)
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

    // Handle portfolios that exist in database but not in Asana
    for (const [asanaGid, portfolio] of existingPortfoliosMap) {
      if (!asanaPortfoliosMap.has(asanaGid) && asanaGid) {
        console.log('⚠️ Portfolio exists in database but not in Asana:', portfolio.name)
        try {
          // Update portfolio status in database
          const { error: updateError } = await supabase
            .from('portfolios')
            .update({
              sync_enabled: false,
              asana_sync_enabled: false,
              sync_error: 'Portfolio not found in Asana',
              last_sync_at: now
            })
            .eq('id', portfolio.id)

          if (updateError) {
            console.error('❌ Error updating portfolio sync status:', updateError)
            continue
          }

          processedPortfolios.push({
            ...portfolio,
            sync_enabled: false,
            asana_sync_enabled: false,
            last_sync_at: now
          })
        } catch (error) {
          console.error('❌ Error handling missing portfolio:', error)
          continue
        }
      }
    }

    console.log('✅ Successfully synced portfolios:', processedPortfolios)
    return new Response(
      JSON.stringify({
        portfolios: processedPortfolios,
        details: {
          total: processedPortfolios.length,
          asana_total: asanaData.data.length,
          sync_time: now
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