
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Smart workspace sync function running")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // التحقق من التوكن
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing Asana access token')
    }

    // جلب معرف مساحة العمل من الطلب
    const { workspaceId } = await req.json()
    if (!workspaceId) {
      throw new Error('Workspace ID is required')
    }

    console.log('🔄 Starting smart sync for workspace:', workspaceId)

    // جلب حالة المزامنة الحالية
    const { data: syncStatus, error: syncStatusError } = await supabaseClient
      .from('workspace_sync_status')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()

    if (syncStatusError && syncStatusError.code !== 'PGRST116') {
      console.error('Error fetching sync status:', syncStatusError)
      throw syncStatusError
    }

    const lastEtag = syncStatus?.etag
    console.log('📝 Last sync ETag:', lastEtag)

    // تحضير headers للطلب من Asana
    const headers = {
      'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
      'Accept': 'application/json'
    }
    if (lastEtag) {
      headers['If-None-Match'] = lastEtag
    }

    // جلب البيانات من Asana
    console.log('🔄 Fetching portfolios from Asana...')
    const portfoliosResponse = await fetch(
      'https://app.asana.com/api/1.0/portfolios',
      { headers }
    )

    // التحقق من الاستجابة
    if (portfoliosResponse.status === 304) {
      console.log('✨ No changes since last sync')
      return new Response(
        JSON.stringify({ 
          message: 'No changes since last sync',
          portfolios: [] 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (!portfoliosResponse.ok) {
      const errorText = await portfoliosResponse.text()
      console.error('❌ Error fetching portfolios:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    // معالجة البيانات الجديدة
    const portfoliosData = await portfoliosResponse.json()
    const newEtag = portfoliosResponse.headers.get('ETag')
    console.log('📊 Received portfolios:', portfoliosData)
    console.log('🏷️ New ETag:', newEtag)

    // تحديث حالة المزامنة
    const { error: updateError } = await supabaseClient
      .from('workspace_sync_status')
      .upsert({
        workspace_id: workspaceId,
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        etag: newEtag,
        sync_error: null
      })

    if (updateError) {
      console.error('❌ Error updating sync status:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        portfolios: portfoliosData.data,
        syncStatus: 'success',
        lastSyncAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in smart sync function:', error)
    
    // تحديث حالة المزامنة في حالة الخطأ
    if (error instanceof Error) {
      const { workspaceId } = await req.json().catch(() => ({ workspaceId: null }))
      if (workspaceId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('workspace_sync_status')
          .upsert({
            workspace_id: workspaceId,
            last_sync_at: new Date().toISOString(),
            last_sync_status: 'error',
            sync_error: error.message
          })
      }
    }

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
