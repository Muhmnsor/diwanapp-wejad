
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const asanaApiUrl = "https://app.asana.com/api/1.0"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting full portfolio sync...')
    
    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    const accessToken = Deno.env.get('ASANA_ACCESS_TOKEN')

    if (!workspaceId || !accessToken) {
      throw new Error('Missing required environment variables')
    }

    console.log('📂 Fetching portfolios from Asana workspace:', workspaceId)

    // جلب جميع المشاريع في مساحة العمل
    const projectsResponse = await fetch(`${asanaApiUrl}/projects?workspace=${workspaceId}&opt_fields=name,gid,notes,archived,team,team.name`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!projectsResponse.ok) {
      const error = await projectsResponse.json()
      throw new Error(`Asana API error: ${JSON.stringify(error)}`)
    }

    const projectsData = await projectsResponse.json()
    console.log('📊 Retrieved projects from Asana:', projectsData)

    // فلترة المشاريع للحصول على المحافظ فقط (المشاريع التي تنتمي لفريق DFY)
    let portfoliosData = projectsData.data.filter(project => 
      !project.archived && 
      project.team && 
      project.team.name === "DFY"
    )

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

    // جلب المحافظ الموجودة في قاعدة البيانات
    const { data: existingPortfolios, error: fetchError } = await supabaseClient
      .from('portfolios')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    console.log('📊 Current portfolios in database:', existingPortfolios?.length || 0)

    const operations = []
    const processedPortfolios = []

    // مزامنة المحافظ
    for (const portfolio of portfoliosData) {
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
        const { data, error } = await supabaseClient
          .from('portfolios')
          .insert(portfolioData)
          .select()
          .single()

        if (error) throw error
        processedPortfolios.push(data)
      } else if (
        existingPortfolio.name !== portfolio.name || 
        existingPortfolio.description !== (portfolio.notes || '')
      ) {
        console.log(`🔄 Updating portfolio: ${portfolio.name}`)
        const { data, error } = await supabaseClient
          .from('portfolios')
          .update(portfolioData)
          .eq('asana_gid', portfolio.gid)
          .select()
          .single()

        if (error) throw error
        processedPortfolios.push(data)
      } else {
        console.log(`✨ Portfolio already up to date: ${portfolio.name}`)
        processedPortfolios.push({...existingPortfolio})
      }
    }

    console.log('✅ Sync completed successfully')
    
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
