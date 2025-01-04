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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, eventId, projectId, registrationId, activityId, recipientPhone, templateId, variables } = await req.json() as NotificationPayload

    console.log('Sending notification:', { type, eventId, projectId, registrationId, activityId })

    // Get WhatsApp settings
    const { data: whatsappSettings } = await supabaseClient
      .from('whatsapp_settings')
      .select('*')
      .single()

    if (!whatsappSettings) {
      throw new Error('WhatsApp settings not found')
    }

    // Get template content
    const { data: template } = await supabaseClient
      .from('whatsapp_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (!template) {
      throw new Error('Template not found')
    }

    // Replace variables in template
    let messageContent = template.content
    Object.entries(variables).forEach(([key, value]) => {
      messageContent = messageContent.replace(`{{${key}}}`, value)
    })

    // Send WhatsApp message using Meta API
    const response = await fetch(`https://graph.facebook.com/v17.0/${whatsappSettings.whatsapp_number_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappSettings.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: { body: messageContent }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message')
    }

    // Log notification
    const { error: logError } = await supabaseClient
      .from('notification_logs')
      .insert({
        event_id: eventId,
        project_id: projectId,
        registration_id: registrationId,
        notification_type: type,
        template_id: templateId,
        status: 'sent'
      })

    if (logError) {
      console.error('Error logging notification:', logError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})