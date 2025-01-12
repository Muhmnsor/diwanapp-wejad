import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from Create Asana Task!")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workspaceId, title, description, dueDate, priority } = await req.json()

    // Get Asana access token from environment variable
    const asanaAccessToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaAccessToken) {
      throw new Error('Asana access token not configured')
    }

    // Create task in Asana
    const asanaResponse = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${asanaAccessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          workspace: workspaceId,
          name: title,
          notes: description,
          due_on: dueDate,
          custom_fields: {
            priority: priority
          }
        }
      })
    })

    if (!asanaResponse.ok) {
      const errorData = await asanaResponse.json()
      console.error('Asana API error:', errorData)
      throw new Error('Failed to create task in Asana')
    }

    const asanaData = await asanaResponse.json()
    
    return new Response(
      JSON.stringify(asanaData.data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})