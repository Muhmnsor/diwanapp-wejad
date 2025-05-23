
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface NotificationPayload {
  type: 'registration' | 'reminder' | 'feedback' | 'certificate' | 'activity' | 'update' | 'announcement';
  eventId?: string;
  projectId?: string;
  registrationId?: string;
  activityId?: string;
  recipientPhone: string;
  templateId: string;
  variables: Record<string, string>;
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

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
    const payload = await req.json() as NotificationPayload
    console.log('Processing notification request:', { 
      type: payload.type, 
      eventId: payload.eventId, 
      projectId: payload.projectId,
      recipientPhone: payload.recipientPhone ? '****' + payload.recipientPhone.slice(-4) : undefined 
    })

    // Validate required fields
    if (!payload.recipientPhone) {
      throw { code: 'MISSING_PHONE', message: 'Recipient phone is required' }
    }

    if (!payload.templateId) {
      throw { code: 'MISSING_TEMPLATE', message: 'Template ID is required' }
    }

    // Format the phone number if needed
    if (!payload.recipientPhone.startsWith('+')) {
      // If number starts with 0, replace with country code
      if (payload.recipientPhone.startsWith('0')) {
        payload.recipientPhone = '+966' + payload.recipientPhone.substring(1);
      } 
      // If number doesn't have country code, add it
      else if (!payload.recipientPhone.startsWith('966')) {
        payload.recipientPhone = '+966' + payload.recipientPhone;
      }
      // If it starts with 966 but no +, add it
      else {
        payload.recipientPhone = '+' + payload.recipientPhone;
      }
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

    // Get template content
    const { data: template, error: templateError } = await supabaseClient
      .from('whatsapp_templates')
      .select('*')
      .eq('id', payload.templateId)
      .single()

    if (templateError) {
      console.error('Error fetching template:', templateError)
      throw { code: 'TEMPLATE_ERROR', message: 'Failed to fetch template', details: templateError }
    }

    if (!template) {
      throw { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' }
    }

    // Replace variables in template
    let messageContent = template.content
    Object.entries(payload.variables).forEach(([key, value]) => {
      messageContent = messageContent.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
    })

    // Create notification log entry with pending status
    const { data: logEntry, error: logError } = await supabaseClient
      .from('notification_logs')
      .insert({
        event_id: payload.eventId,
        project_id: payload.projectId,
        registration_id: payload.registrationId,
        notification_type: payload.type,
        template_id: payload.templateId,
        status: 'pending',
        recipient_phone: payload.recipientPhone,
        message_content: messageContent,
        retry_count: 0,
        last_error: null
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating notification log:', logError)
      throw { code: 'LOG_ERROR', message: 'Failed to create notification log', details: logError }
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
          to: payload.recipientPhone,
          type: 'text',
          text: { body: messageContent }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('WhatsApp API error response:', errorData)
        throw { code: 'WHATSAPP_API_ERROR', message: 'Failed to send WhatsApp message', details: errorData }
      }

      const responseData = await response.json()
      console.log('WhatsApp API response:', responseData)

      // Update notification log with success status
      const { error: updateError } = await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'sent',
          message_id: responseData.messages?.[0]?.id,
          sent_at: new Date().toISOString()
        })
        .eq('id', logEntry.id)

      if (updateError) {
        console.error('Error updating notification log:', updateError)
      }

      return new Response(
        JSON.stringify({ success: true, logId: logEntry.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      // Update notification log with error status
      const { error: updateError } = await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'failed',
          error_details: JSON.stringify(error),
          retry_count: 1,
          last_error: error.message || 'Unknown error',
          last_retry: new Date().toISOString()
        })
        .eq('id', logEntry.id)

      if (updateError) {
        console.error('Error updating notification log:', updateError)
      }

      throw error
    }

  } catch (error) {
    console.error('Error processing notification:', error)
    const errorResponse: ErrorResponse = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details
    }

    return new Response(
      JSON.stringify({ success: false, error: errorResponse.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
