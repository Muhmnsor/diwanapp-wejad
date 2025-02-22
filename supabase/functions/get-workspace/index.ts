
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Client } from 'https://esm.sh/asana@1.0.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting full portfolio sync...')
    
    const client = Client.create({
      defaultHeaders: { 'Asana-Enable': 'new_project_templates,new_user_task_lists' },
      logAsanaChangeWarnings: false
    }).useAccessToken(Deno.env.get('ASANA_ACCESS_TOKEN'))

    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    if (!workspaceId) {
      throw new Error('ASANA_WORKSPACE_ID is not configured')
    }

    console.log('📂 Fetching all portfolios and projects from Asana workspace:', workspaceId)

    // جلب المحافظ باستخدام API للمشاريع
    const allPortfolios = await client.projects.findAll({
      workspace: workspaceId,
      opt_fields: 'name,gid,notes,owner,created_at,modified_at,archived,public,resource_type,team,workspace',
      archived: false,
      resource_type: 'portfolio'
    })

    const portfoliosData = []
    for await (const portfolio of allPortfolios) {
      if (portfolio.resource_type === 'portfolio') {
        portfoliosData.push(portfolio)
      }
    }

    if (portfoliosData.length === 0) {
      console.log('⚠️ No portfolios found in Asana workspace')
      return new Response(
        JSON.stringify({ message: 'No portfolios found in workspace' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Found ${portfoliosData.length} portfolios in Asana`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingPortfolios, error: fetchError } = await supabaseClient
      .from('portfolios')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching existing portfolios:', fetchError)
      throw fetchError
    }

    console.log('📊 Current portfolios in database:', existingPortfolios?.length || 0)

    const syncOperations = []
    const processedPortfolios = []

    for (const asanaPortfolio of portfoliosData) {
      const existingPortfolio = existingPortfolios?.find(p => p.asana_gid === asanaPortfolio.gid)
      
      const portfolioData = {
        name: asanaPortfolio.name,
        description: asanaPortfolio.notes || '',
        asana_gid: asanaPortfolio.gid,
        sync_enabled: true,
        asana_sync_enabled: true,
        last_sync_at: new Date().toISOString()
      }

      if (!existingPortfolio) {
        console.log(`➕ Creating new portfolio: ${asanaPortfolio.name}`)
        syncOperations.push(
          supabaseClient
            .from('portfolios')
            .insert(portfolioData)
        )
      } else {
        console.log(`🔄 Updating existing portfolio: ${asanaPortfolio.name}`)
        syncOperations.push(
          supabaseClient
            .from('portfolios')
            .update(portfolioData)
            .eq('asana_gid', asanaPortfolio.gid)
        )
      }

      processedPortfolios.push({
        ...portfolioData,
        id: existingPortfolio?.id
      })
    }

    // تنفيذ عمليات المزامنة بالتوازي
    await Promise.all(syncOperations)
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
      JSON.stringify({
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
