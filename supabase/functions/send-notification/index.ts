import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface NotificationPayload {
  type: 'registration' | 'reminder' | 'feedback' | 'certificate' | 'activity';
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
    console.log('Processing notification request:', { type: payload.type, eventId: payload.eventId, projectId: payload.projectId })

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
      messageContent = messageContent.replace(`{{${key}}}`, value)
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
        status: 'pending'
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
        throw { code: 'WHATSAPP_API_ERROR', message: 'Failed to send WhatsApp message', details: errorData }
      }

      // Update notification log with success status
      const { error: updateError } = await supabaseClient
        .from('notification_logs')
        .update({ status: 'sent' })
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
          error_details: JSON.stringify(error)
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
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})