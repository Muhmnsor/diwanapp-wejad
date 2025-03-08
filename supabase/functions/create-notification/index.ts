
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

// Define the notification interface
interface Notification {
  user_id: string
  title: string
  message: string
  notification_type: string
  related_entity_id?: string
  related_entity_type?: string
  read: boolean
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const authorizationHeader = req.headers.get('Authorization')
    if (!authorizationHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the request data
    const notification: Notification = await req.json()
    
    console.log('Creating notification with service role:', notification)

    // Validate the required fields
    if (!notification.user_id) {
      throw new Error('user_id is required')
    }
    if (!notification.title) {
      throw new Error('title is required')
    }
    if (!notification.message) {
      throw new Error('message is required')
    }
    if (!notification.notification_type) {
      throw new Error('notification_type is required')
    }

    // Insert the notification using the service role key
    const { data, error } = await supabase
      .from('in_app_notifications')
      .insert(notification)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      throw error
    }

    console.log('Notification created successfully:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    )
  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
