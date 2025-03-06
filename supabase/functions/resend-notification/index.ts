
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate request payload
    const { logId } = await req.json()
    
    if (!logId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Log ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log('Processing resend request for notification log:', logId)

    // Get the notification log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from('notification_logs')
      .select('*')
      .eq('id', logId)
      .single()

    if (logError) {
      console.error('Error fetching notification log:', logError)
      throw { code: 'LOG_ERROR', message: 'Failed to fetch notification log', details: logError }
    }

    if (!logEntry) {
      throw { code: 'LOG_NOT_FOUND', message: 'Notification log not found' }
    }

    // Get WhatsApp settings
    const { data: whatsappSettings, error: settingsError } = await supabaseClient
      .from('whatsapp_settings')
      .select('*')
      .single()

    if (settingsError) {
      console.error('Error fetching WhatsApp settings:', settingsError)
      throw { code: 'SETTINGS_ERROR', message: 'Failed to fetch WhatsApp settings', details: settingsError }
    }

    if (!whatsappSettings) {
      throw { code: 'SETTINGS_NOT_FOUND', message: 'WhatsApp settings not configured' }
    }

    // Update notification log with retry info
    const { error: updateError } = await supabaseClient
      .from('notification_logs')
      .update({ 
        status: 'pending',
        retry_count: logEntry.retry_count + 1,
        last_retry: new Date().toISOString()
      })
      .eq('id', logEntry.id)

    if (updateError) {
      console.error('Error updating notification log:', updateError)
      throw { code: 'LOG_UPDATE_ERROR', message: 'Failed to update notification log', details: updateError }
    }

    // Send WhatsApp message
    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${whatsappSettings.whatsapp_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappSettings.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: logEntry.recipient_phone,
          type: 'text',
          text: { body: logEntry.message_content }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw { code: 'WHATSAPP_API_ERROR', message: 'Failed to send WhatsApp message', details: errorData }
      }

      const responseData = await response.json()
      console.log('WhatsApp API response:', responseData)

      // Update notification log with success status
      const { error: finalUpdateError } = await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'sent',
          message_id: responseData.messages?.[0]?.id,
          sent_at: new Date().toISOString(),
          error_details: null,
          last_error: null
        })
        .eq('id', logEntry.id)

      if (finalUpdateError) {
        console.error('Error updating notification log:', finalUpdateError)
      }

      return new Response(
        JSON.stringify({ success: true, logId: logEntry.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      // Update notification log with error status
      const { error: failUpdateError } = await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'failed',
          error_details: JSON.stringify(error),
          last_error: error.message || 'Unknown error'
        })
        .eq('id', logEntry.id)

      if (failUpdateError) {
        console.error('Error updating notification log with failure:', failUpdateError)
      }

      throw error
    }

  } catch (error) {
    console.error('Error processing notification resend:', error)
    const errorResponse = {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
