
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import asana from 'https://esm.sh/asana@1.0.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting full portfolio sync...')
    
    // إنشاء عميل Asana
    const client = asana.Client.create({
      defaultHeaders: { 'Asana-Enable': 'new_project_templates,new_user_task_lists' },
      logAsanaChangeWarnings: false
    }).useAccessToken(Deno.env.get('ASANA_ACCESS_TOKEN'))

    // جلب معرف مساحة العمل
    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    if (!workspaceId) {
      throw new Error('ASANA_WORKSPACE_ID is not configured')
    }

    console.log('📂 Fetching portfolios from Asana workspace:', workspaceId)

    // جلب جميع المحافظ من Asana
    const portfoliosResponse = await client.portfolios.findByWorkspace(workspaceId, {
      opt_fields: 'name,gid,color,owner,custom_field_settings,custom_fields,created_at,modified_at,workspace,permalink_url'
    })

    if (!portfoliosResponse.data || portfoliosResponse.data.length === 0) {
      console.log('⚠️ No portfolios found in Asana workspace')
      return new Response(
        JSON.stringify({ message: 'No portfolios found in workspace' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Found ${portfoliosResponse.data.length} portfolios in Asana`)

    // إنشاء عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // جلب المحافظ الحالية من Supabase
    const { data: existingPortfolios, error: fetchError } = await supabaseClient
      .from('portfolios')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching existing portfolios:', fetchError)
      throw fetchError
    }

    console.log('📊 Current portfolios in database:', existingPortfolios?.length || 0)

    // تحديث أو إنشاء المحافظ
    const syncOperations = []

    for (const asanaPortfolio of portfoliosResponse.data) {
      const existingPortfolio = existingPortfolios?.find(p => p.asana_gid === asanaPortfolio.gid)

      if (!existingPortfolio) {
        // إنشاء محفظة جديدة
        console.log(`➕ Creating new portfolio: ${asanaPortfolio.name}`)
        syncOperations.push(
          supabaseClient
            .from('portfolios')
            .insert({
              name: asanaPortfolio.name,
              asana_gid: asanaPortfolio.gid,
              description: '',
              sync_enabled: true,
              asana_sync_enabled: true,
              last_sync_at: new Date().toISOString()
            })
        )
      } else {
        // تحديث المحفظة الموجودة
        console.log(`🔄 Updating existing portfolio: ${asanaPortfolio.name}`)
        syncOperations.push(
          supabaseClient
            .from('portfolios')
            .update({
              name: asanaPortfolio.name,
              last_sync_at: new Date().toISOString()
            })
            .eq('asana_gid', asanaPortfolio.gid)
        )
      }
    }

    // تنفيذ عمليات المزامنة
    await Promise.all(syncOperations)
    console.log('✅ Portfolio sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Portfolios synced successfully',
        count: portfoliosResponse.data.length,
        portfolios: portfoliosResponse.data
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
