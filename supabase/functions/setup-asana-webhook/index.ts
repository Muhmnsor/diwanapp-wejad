import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Setup Asana webhook function running")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!ASANA_ACCESS_TOKEN || !ASANA_WORKSPACE_ID) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get the Supabase function URL for the webhook handler
    const webhookUrl = `${SUPABASE_URL}/functions/v1/handle-asana-webhook`
    console.log('📍 Webhook URL:', webhookUrl)

    // Create webhook in Asana
    const response = await fetch('https://app.asana.com/api/1.0/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          resource: ASANA_WORKSPACE_ID,
          target: webhookUrl,
          filters: [
            {
              resource_type: 'portfolio',
              action: 'changed'
            },
            {
              resource_type: 'portfolio',
              action: 'added'
            },
            {
              resource_type: 'portfolio',
              action: 'deleted'
            }
          ]
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Error creating Asana webhook:', errorData)
      throw new Error(`Failed to create Asana webhook: ${errorData}`)
    }

    const webhookData = await response.json()
    console.log('✅ Successfully created Asana webhook:', webhookData)

    // Store webhook information in Supabase
    const { error: dbError } = await supabase
      .from('sync_status')
      .update({
        sync_enabled: true,
        last_sync: new Date().toISOString(),
        sync_interval: 5 // 5 minutes default interval
      })
      .eq('department_id', ASANA_WORKSPACE_ID)

    if (dbError) {
      console.error('❌ Error updating sync status:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({ success: true, webhook: webhookData.data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in setup-asana-webhook:', error)
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