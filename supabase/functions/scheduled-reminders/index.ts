
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    console.log('Starting scheduled reminders check...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current date (in UTC)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const formattedTomorrow = tomorrow.toISOString().split('T')[0]
    
    // --------------- Event Reminders ---------------
    await processEventReminders(supabase, formattedTomorrow)
    
    // --------------- Task Due Date Reminders ---------------
    await processTaskReminders(supabase, formattedTomorrow)
    
    // --------------- Project Activity Reminders ---------------
    await processActivityReminders(supabase, formattedTomorrow)
    
    return new Response(
      JSON.stringify({ success: true, message: 'Reminders processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing reminders:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processEventReminders(supabase: any, tomorrowDate: string) {
  console.log(`Processing event reminders for ${tomorrowDate}`)
  
  // Get events happening tomorrow
  const { data: events, error: eventsError } = await supabase
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
        phone,
        user_id
      )
    `)
    .eq('date', tomorrowDate)
  
  if (eventsError) {
    console.error('Error fetching upcoming events:', eventsError)
    return
  }
  
  console.log(`Found ${events?.length || 0} events for tomorrow`)
  
  // Get reminder template
  const { data: template, error: templateError } = await supabase
    .from('whatsapp_templates')
    .select('id')
    .eq('notification_type', 'event_reminder')
    .eq('is_default', true)
    .single()
  
  if (templateError) {
    console.error('Error finding reminder template:', templateError)
    return
  }
  
  // Process each event
  for (const event of events || []) {
    for (const registration of event.registrations || []) {
      console.log(`Processing reminder for registration ${registration.id} in event ${event.title}`)
      
      // 1. Check if reminder has already been sent
      const { data: existingReminder } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('event_id', event.id)
        .eq('registration_id', registration.id)
        .eq('notification_type', 'reminder')
        .single()
      
      if (existingReminder) {
        console.log(`Reminder already sent for registration ${registration.id}`)
        continue
      }
      
      // 2. Create in-app notification if user_id exists
      if (registration.user_id) {
        await supabase
          .from('in_app_notifications')
          .insert({
            user_id: registration.user_id,
            title: `تذكير: فعالية ${event.title} غداً`,
            message: `تذكير: فعالية ${event.title} ستقام غداً الساعة ${event.time || '--'} في ${event.location || '--'}`,
            notification_type: 'event',
            related_entity_id: event.id,
            related_entity_type: 'event',
            read: false
          })
      }
      
      // 3. Send WhatsApp notification
      if (registration.phone && template) {
        try {
          // Call the send-notification function
          const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'reminder',
              eventId: event.id,
              registrationId: registration.id,
              recipientPhone: registration.phone,
              templateId: template.id,
              variables: {
                name: registration.arabic_name,
                event_title: event.title,
                event_date: event.date,
                event_time: event.time || '',
                event_location: event.location || ''
              }
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error(`Error sending reminder to ${registration.arabic_name}:`, error)
          }
        } catch (error) {
          console.error(`Error in WhatsApp notification for ${registration.id}:`, error)
        }
      }
    }
  }
}

async function processTaskReminders(supabase: any, tomorrowDate: string) {
  console.log(`Processing task reminders for ${tomorrowDate}`)
  
  // Get tasks due tomorrow
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      id, 
      title, 
      due_date, 
      assigned_to,
      project_id,
      projects (title)
    `)
    .eq('due_date', tomorrowDate)
    .not('status', 'eq', 'completed')
    .not('status', 'eq', 'canceled')
  
  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
    return
  }
  
  console.log(`Found ${tasks?.length || 0} tasks due tomorrow`)
  
  // Process each task
  for (const task of tasks || []) {
    if (!task.assigned_to) continue
    
    console.log(`Sending reminder for task ${task.title} to user ${task.assigned_to}`)
    
    // Create in-app notification
    await supabase
      .from('in_app_notifications')
      .insert({
        user_id: task.assigned_to,
        title: `تذكير: موعد تسليم المهمة غداً`,
        message: `تذكير: موعد تسليم المهمة "${task.title}"${task.projects?.title ? ` في مشروع "${task.projects.title}"` : ''} غداً`,
        notification_type: 'task',
        related_entity_id: task.id,
        related_entity_type: 'task',
        read: false
      })
  }
  
  // Also check subtasks
  const { data: subtasks, error: subtasksError } = await supabase
    .from('subtasks')
    .select(`
      id, 
      title, 
      due_date, 
      assigned_to,
      parent_task_id,
      tasks (title, project_id, projects (title))
    `)
    .eq('due_date', tomorrowDate)
    .not('status', 'eq', 'completed')
    .not('status', 'eq', 'canceled')
  
  if (subtasksError) {
    console.error('Error fetching subtasks:', subtasksError)
    return
  }
  
  console.log(`Found ${subtasks?.length || 0} subtasks due tomorrow`)
  
  // Process each subtask
  for (const subtask of subtasks || []) {
    if (!subtask.assigned_to) continue
    
    console.log(`Sending reminder for subtask ${subtask.title} to user ${subtask.assigned_to}`)
    
    // Create in-app notification
    await supabase
      .from('in_app_notifications')
      .insert({
        user_id: subtask.assigned_to,
        title: `تذكير: موعد تسليم المهمة الفرعية غداً`,
        message: `تذكير: موعد تسليم المهمة الفرعية "${subtask.title}" في المهمة "${subtask.tasks?.title}"${subtask.tasks?.projects?.title ? ` (مشروع "${subtask.tasks.projects.title}")` : ''} غداً`,
        notification_type: 'task',
        related_entity_id: subtask.id,
        related_entity_type: 'subtask',
        read: false
      })
  }
}

async function processActivityReminders(supabase: any, tomorrowDate: string) {
  console.log(`Processing activity reminders for ${tomorrowDate}`)
  
  // Get project activities happening tomorrow
  const { data: activities, error: activitiesError } = await supabase
    .from('project_activities')
    .select(`
      id,
      title,
      project_id,
      projects (title),
      date,
      time,
      location,
      event_id
    `)
    .eq('date', tomorrowDate)
  
  if (activitiesError) {
    console.error('Error fetching activities:', activitiesError)
    return
  }
  
  console.log(`Found ${activities?.length || 0} project activities for tomorrow`)
  
  // For each activity, get project members
  for (const activity of activities || []) {
    // Get project members
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select(`
        user_id,
        profiles (
          display_name,
          phone
        )
      `)
      .eq('project_id', activity.project_id)
    
    if (membersError) {
      console.error(`Error fetching members for project ${activity.project_id}:`, membersError)
      continue
    }
    
    console.log(`Found ${members?.length || 0} members for project ${activity.project_id}`)
    
    // Get activity template
    const { data: template } = await supabase
      .from('whatsapp_templates')
      .select('id')
      .eq('notification_type', 'project_activity')
      .eq('is_default', true)
      .maybeSingle()
    
    // Notify each project member
    for (const member of members || []) {
      if (!member.user_id) continue
      
      console.log(`Sending activity reminder to user ${member.user_id}`)
      
      // Create in-app notification
      await supabase
        .from('in_app_notifications')
        .insert({
          user_id: member.user_id,
          title: `تذكير: نشاط ${activity.title} غداً`,
          message: `تذكير: نشاط ${activity.title} في مشروع ${activity.projects?.title || ''} سيقام غداً الساعة ${activity.time || '--'} في ${activity.location || '--'}`,
          notification_type: 'project',
          related_entity_id: activity.project_id,
          related_entity_type: 'project',
          read: false
        })
      
      // Send WhatsApp notification if phone and template exist
      if (member.profiles?.phone && template) {
        try {
          // Call the send-notification function
          const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'activity_reminder',
              projectId: activity.project_id,
              activityId: activity.id,
              eventId: activity.event_id,
              recipientPhone: member.profiles.phone,
              templateId: template.id,
              variables: {
                name: member.profiles.display_name || 'عضو المشروع',
                activity_title: activity.title,
                project_title: activity.projects?.title || '',
                activity_date: activity.date,
                activity_time: activity.time || '',
                activity_location: activity.location || ''
              }
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error(`Error sending reminder to ${member.profiles.display_name}:`, error)
          }
        } catch (error) {
          console.error(`Error in WhatsApp notification for ${member.user_id}:`, error)
        }
      }
    }
  }
}
