import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workspaceId, title, description, dueDate } = await req.json()

    console.log('Creating task in Asana:', { workspaceId, title, description, dueDate })

    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing ASANA_ACCESS_TOKEN')
    }

    if (!ASANA_WORKSPACE_ID) {
      throw new Error('Missing ASANA_WORKSPACE_ID')
    }

    // Create task in Asana
    const asanaResponse = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          workspace: ASANA_WORKSPACE_ID,
          projects: [workspaceId],
          name: title,
          notes: description || '',
          due_on: dueDate || null
        }
      })
    })

    if (!asanaResponse.ok) {
      const errorData = await asanaResponse.json()
      console.error('Asana API error:', errorData)
      throw new Error(`Failed to create task in Asana: ${errorData?.errors?.[0]?.message || asanaResponse.statusText}`)
    }

    const asanaData = await asanaResponse.json()
    console.log('Successfully created task in Asana:', asanaData)

    return new Response(
      JSON.stringify(asanaData.data),
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