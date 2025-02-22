
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
    console.log('🔄 Starting portfolio sync...')
    
    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    const accessToken = Deno.env.get('ASANA_ACCESS_TOKEN')

    if (!workspaceId || !accessToken) {
      throw new Error('Missing required environment variables')
    }

    // استخدام API الأساسي للوصول إلى المحافظ
    const portfoliosResponse = await fetch(
      `https://app.asana.com/api/1.0/portfolios/?opt_fields=name,gid,owner,created_at,modified_at,workspace,workspace.name,color&workspace=${workspaceId}`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!portfoliosResponse.ok) {
      const error = await portfoliosResponse.json()
      throw new Error(`Asana API error: ${JSON.stringify(error)}`)
    }

    const portfoliosResult = await portfoliosResponse.json()
    const portfolios = portfoliosResult.data || []

    if (portfolios.length === 0) {
      console.log('⚠️ No portfolios found in workspace')
      return new Response(
        JSON.stringify({ message: 'No portfolios found in workspace' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Found ${portfolios.length} portfolios in Asana`)

    // جلب تفاصيل إضافية لكل محفظة
    const portfoliosData = await Promise.all(
      portfolios.map(async (portfolio: any) => {
        const detailsResponse = await fetch(
          `https://app.asana.com/api/1.0/portfolios/${portfolio.gid}?opt_fields=name,gid,notes,owner,created_at,modified_at,workspace,items.name,items.gid,items.resource_type`, 
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        )
        
        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          return details.data
        }
        
        console.warn(`⚠️ Could not fetch details for portfolio ${portfolio.gid}`)
        return portfolio
      })
    )

    console.log('📊 Retrieved portfolio details')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingPortfolios, error: fetchError } = await supabaseClient
      .from('portfolios')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    console.log('📊 Current portfolios in database:', existingPortfolios?.length || 0)

    // مزامنة المحافظ
    const syncResults = await Promise.all(
      portfoliosData.map(async (portfolio) => {
        const existingPortfolio = existingPortfolios?.find(p => p.asana_gid === portfolio.gid)
        
        const portfolioData = {
          name: portfolio.name,
          description: portfolio.notes || '',
          asana_gid: portfolio.gid,
          sync_enabled: true,
          asana_sync_enabled: true,
          last_sync_at: new Date().toISOString()
        }

        if (!existingPortfolio) {
          console.log(`➕ Creating new portfolio: ${portfolio.name}`)
          return supabaseClient
            .from('portfolios')
            .insert(portfolioData)
            .select()
            .single()
        } 
        
        if (existingPortfolio.name !== portfolio.name || existingPortfolio.description !== (portfolio.notes || '')) {
          console.log(`🔄 Updating portfolio: ${portfolio.name}`)
          return supabaseClient
            .from('portfolios')
            .update(portfolioData)
            .eq('asana_gid', portfolio.gid)
            .select()
            .single()
        }

        console.log(`✨ Portfolio already up to date: ${portfolio.name}`)
        return { data: existingPortfolio, error: null }
      })
    )

    const errors = syncResults.filter(result => result.error)
    if (errors.length > 0) {
      console.error('❌ Some portfolios failed to sync:', errors)
    }

    const processedPortfolios = syncResults
      .filter(result => result.data)
      .map(result => result.data)

    console.log('✅ Portfolio sync completed successfully')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Portfolios synced successfully',
        count: processedPortfolios.length,
        portfolios: processedPortfolios
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
