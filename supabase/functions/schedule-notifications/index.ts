import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Checking for notifications to send...')

    // Get all events happening in the next 24 hours
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: upcomingEvents, error: eventsError } = await supabaseClient
      .from('events')
      .select(`
        id,
        title,
        date,
        time,
        location,
        registrations (
          id,
          arabic_name,
          phone
        )
      `)
      .eq('date', tomorrow.toISOString().split('T')[0])

    if (eventsError) throw eventsError

    // Get reminder template
    const { data: reminderTemplate } = await supabaseClient
      .from('whatsapp_templates')
      .select('id')
      .eq('notification_type', 'event_reminder')
      .eq('is_default', true)
      .single()

    if (!reminderTemplate) {
      throw new Error('Reminder template not found')
    }

    // Send reminders for each event
    for (const event of upcomingEvents || []) {
      console.log('Processing reminders for event:', event.title)

      for (const registration of event.registrations) {
        // Check if reminder was already sent
        const { data: existingLog } = await supabaseClient
          .from('notification_logs')
          .select('id')
          .eq('event_id', event.id)
          .eq('registration_id', registration.id)
          .eq('notification_type', 'reminder')
          .single()

        if (existingLog) {
          console.log('Reminder already sent for registration:', registration.id)
          continue
        }

        // Send reminder
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'reminder',
            eventId: event.id,
            registrationId: registration.id,
            recipientPhone: registration.phone,
            templateId: reminderTemplate.id,
            variables: {
              name: registration.arabic_name,
              event_title: event.title,
              event_date: event.date,
              event_time: event.time,
              event_location: event.location
            }
          })
        })

        if (!response.ok) {
          console.error('Failed to send reminder for registration:', registration.id)
        }
      }
    }

    // Process project activity reminders similarly
    const { data: upcomingActivities, error: activitiesError } = await supabaseClient
      .from('events')
      .select(`
        id,
        title,
        date,
        time,
        location,
        project_id,
        registrations (
          id,
          arabic_name,
          phone
        )
      `)
      .eq('is_project_activity', true)
      .eq('date', tomorrow.toISOString().split('T')[0])

    if (activitiesError) throw activitiesError

    // Get activity reminder template
    const { data: activityTemplate } = await supabaseClient
      .from('whatsapp_templates')
      .select('id')
      .eq('notification_type', 'activity_reminder')
      .eq('is_default', true)
      .single()

    if (!activityTemplate) {
      throw new Error('Activity reminder template not found')
    }

    // Send reminders for each activity
    for (const activity of upcomingActivities || []) {
      console.log('Processing reminders for activity:', activity.title)

      for (const registration of activity.registrations) {
        // Check if reminder was already sent
        const { data: existingLog } = await supabaseClient
          .from('notification_logs')
          .select('id')
          .eq('event_id', activity.id)
          .eq('registration_id', registration.id)
          .eq('notification_type', 'activity_reminder')
          .single()

        if (existingLog) {
          console.log('Reminder already sent for registration:', registration.id)
          continue
        }

        // Send reminder
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'activity_reminder',
            eventId: activity.id,
            projectId: activity.project_id,
            registrationId: registration.id,
            recipientPhone: registration.phone,
            templateId: activityTemplate.id,
            variables: {
              name: registration.arabic_name,
              activity_title: activity.title,
              activity_date: activity.date,
              activity_time: activity.time,
              activity_location: activity.location
            }
          })
        })

        if (!response.ok) {
          console.error('Failed to send reminder for registration:', registration.id)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scheduling notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})