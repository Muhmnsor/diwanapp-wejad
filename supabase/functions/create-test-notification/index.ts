
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

    // Get the request body
    const { userId, type = 'system', count = 1 } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log(`Creating ${count} test notifications for user ${userId}`)

    // Notification types with their respective icons and messages
    const notificationTypes = {
      event: {
        title: 'إشعار فعالية تجريبي',
        message: 'هذا إشعار تجريبي لفعالية جديدة',
        related_entity_type: 'event'
      },
      task: {
        title: 'إشعار مهمة تجريبي',
        message: 'هذا إشعار تجريبي لمهمة جديدة',
        related_entity_type: 'task'
      },
      project: {
        title: 'إشعار مشروع تجريبي',
        message: 'هذا إشعار تجريبي لمشروع جديد',
        related_entity_type: 'project'
      },
      user: {
        title: 'إشعار مستخدم تجريبي',
        message: 'هذا إشعار تجريبي لمستخدم جديد',
        related_entity_type: 'user'
      },
      comment: {
        title: 'إشعار تعليق تجريبي',
        message: 'هذا إشعار تجريبي لتعليق جديد',
        related_entity_type: 'comment'
      },
      system: {
        title: 'إشعار نظام تجريبي',
        message: 'هذا إشعار تجريبي من النظام',
        related_entity_type: 'system'
      }
    }

    const notificationsToCreate = []
    
    // If specific type is requested, create that type only
    if (type !== 'all' && notificationTypes[type]) {
      for (let i = 0; i < count; i++) {
        const notification = {
          user_id: userId,
          title: `${notificationTypes[type].title} #${i + 1}`,
          message: `${notificationTypes[type].message} #${i + 1}`,
          notification_type: type,
          related_entity_type: notificationTypes[type].related_entity_type,
          related_entity_id: crypto.randomUUID(),
          read: false // تعيين جميع الإشعارات كغير مقروءة
        }
        notificationsToCreate.push(notification)
      }
    } 
    // Create one of each type for 'all'
    else if (type === 'all') {
      Object.keys(notificationTypes).forEach((notifType, index) => {
        const notification = {
          user_id: userId,
          title: `${notificationTypes[notifType].title}`,
          message: `${notificationTypes[notifType].message}`,
          notification_type: notifType,
          related_entity_type: notificationTypes[notifType].related_entity_type,
          related_entity_id: crypto.randomUUID(),
          read: false // تعيين جميع الإشعارات كغير مقروءة
        }
        notificationsToCreate.push(notification)
      })
    }

    // Insert the notifications
    const { data, error } = await supabaseClient
      .from('in_app_notifications')
      .insert(notificationsToCreate)
      .select()

    if (error) {
      throw error
    }

    console.log(`Successfully created ${notificationsToCreate.length} notifications`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: notificationsToCreate.length,
        notifications: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating test notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
