import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Asana webhook handler function running")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing ASANA_ACCESS_TOKEN')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Parse webhook payload
    const payload = await req.json()
    console.log('📥 Received Asana webhook:', payload)

    // Handle different event types
    for (const event of payload.events) {
      console.log('🔄 Processing event:', event)

      const { resource, action } = event
      const resourceType = event.resource.resource_type

      if (resourceType === 'portfolio') {
        switch (action) {
          case 'added':
          case 'changed': {
            // Fetch portfolio details from Asana
            const portfolioResponse = await fetch(
              `https://app.asana.com/api/1.0/portfolios/${resource.gid}`,
              {
                headers: {
                  'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
                  'Accept': 'application/json'
                }
              }
            )

            if (!portfolioResponse.ok) {
              throw new Error(`Failed to fetch portfolio from Asana: ${await portfolioResponse.text()}`)
            }

            const portfolioData = await portfolioResponse.json()
            console.log('📊 Portfolio data from Asana:', portfolioData)

            // Update or create portfolio in database
            const { error: upsertError } = await supabase
              .from('portfolios')
              .upsert({
                name: portfolioData.data.name,
                description: portfolioData.data.notes || '',
                asana_gid: portfolioData.data.gid,
                asana_sync_enabled: true,
                sync_enabled: true,
                last_sync_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (upsertError) {
              console.error('❌ Error upserting portfolio:', upsertError)
              throw upsertError
            }

            console.log('✅ Successfully processed portfolio update')
            break
          }

          case 'deleted': {
            // Handle portfolio deletion
            const { error: deleteError } = await supabase
              .from('portfolios')
              .update({
                sync_enabled: false,
                asana_sync_enabled: false,
                sync_error: 'Portfolio deleted in Asana',
                last_sync_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('asana_gid', resource.gid)

            if (deleteError) {
              console.error('❌ Error handling portfolio deletion:', deleteError)
              throw deleteError
            }

            console.log('✅ Successfully processed portfolio deletion')
            break
          }

          default:
            console.log('⚠️ Unhandled action:', action)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in webhook handler:', error)
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