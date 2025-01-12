import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Create Asana Task function started")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workspaceId, title, description, dueDate, priority } = await req.json()
    console.log('Received request with data:', { workspaceId, title, description, dueDate, priority })

    // Validate required fields
    if (!workspaceId || !title) {
      throw new Error('Workspace ID and title are required')
    }

    // Get Asana access token
    const asanaAccessToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaAccessToken) {
      console.error('Asana access token not found')
      throw new Error('Asana access token not configured')
    }

    // Get the Asana workspace ID from environment
    const asanaWorkspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    if (!asanaWorkspaceId) {
      console.error('Asana workspace ID not found')
      throw new Error('Asana workspace ID not configured')
    }

    console.log('Creating task in Asana workspace:', asanaWorkspaceId)

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
          workspace: asanaWorkspaceId,
          projects: [workspaceId],
          name: title,
          notes: description || '',
          due_on: dueDate || null
          // Removed the custom field priority since it's not configured in Asana
        }
      })
    })

    const responseData = await asanaResponse.json()
    
    if (!asanaResponse.ok) {
      console.error('Asana API error:', responseData)
      throw new Error(`Failed to create task in Asana: ${responseData.errors?.[0]?.message || 'Unknown error'}`)
    }

    console.log('Successfully created task in Asana:', responseData)
    
    return new Response(
      JSON.stringify(responseData.data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create-asana-task function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})