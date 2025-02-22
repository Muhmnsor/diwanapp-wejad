
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting portfolio sync from Asana...')
    
    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!asanaToken || !workspaceId || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Get portfolios from Asana
    const portfoliosResponse = await fetch(
      `https://app.asana.com/api/1.0/portfolios?workspace=${workspaceId}&opt_fields=name,gid,color,created_at,modified_at,owner,notes`, 
      {
        headers: {
          'Authorization': `Bearer ${asanaToken}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!portfoliosResponse.ok) {
      const error = await portfoliosResponse.json()
      throw new Error(`Asana API error: ${JSON.stringify(error)}`)
    }

    const { data: asanaPortfolios } = await portfoliosResponse.json()
    console.log(`📊 Found ${asanaPortfolios.length} portfolios in Asana`)

    // 2. Get existing portfolios from database
    const { data: existingPortfolios, error: dbError } = await supabase
      .from('portfolios')
      .select('*')

    if (dbError) throw dbError

    // 3. Sync each portfolio
    const syncResults = await Promise.all(asanaPortfolios.map(async (asanaPortfolio: any) => {
      const existing = existingPortfolios?.find(p => p.asana_gid === asanaPortfolio.gid)
      
      const portfolioData = {
        name: asanaPortfolio.name,
        description: asanaPortfolio.notes || '',
        asana_gid: asanaPortfolio.gid,
        last_sync_at: new Date().toISOString(),
        asana_sync_enabled: true,
        sync_enabled: true
      }

      let result
      if (!existing) {
        console.log(`➕ Creating new portfolio: ${asanaPortfolio.name}`)
        result = await supabase
          .from('portfolios')
          .insert(portfolioData)
          .select()
          .single()
      } else if (
        existing.name !== asanaPortfolio.name || 
        existing.description !== (asanaPortfolio.notes || '')
      ) {
        console.log(`🔄 Updating portfolio: ${asanaPortfolio.name}`)
        result = await supabase
          .from('portfolios')
          .update(portfolioData)
          .eq('asana_gid', asanaPortfolio.gid)
          .select()
          .single()
      } else {
        console.log(`✨ Portfolio already up to date: ${asanaPortfolio.name}`)
        result = { data: existing, error: null }
      }

      if (result.error) {
        console.error(`❌ Error syncing portfolio ${asanaPortfolio.name}:`, result.error)
      }
      return result
    }))

    const errors = syncResults.filter(result => result.error)
    if (errors.length > 0) {
      console.error('❌ Some portfolios failed to sync:', errors)
    }

    console.log('✅ Portfolio sync completed successfully')
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Portfolios synced successfully',
        synced: syncResults.filter(r => !r.error).length,
        errors: errors.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('❌ Error in portfolio sync:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
