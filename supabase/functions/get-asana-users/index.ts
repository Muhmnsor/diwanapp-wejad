import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get Asana Users function started")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workspaceId } = await req.json()
    console.log('Fetching users for workspace:', workspaceId)

    // Get Asana access token
    const asanaAccessToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaAccessToken) {
      throw new Error('Asana access token not configured')
    }

    // First get the actual workspace ID from the project
    const projectResponse = await fetch(`https://app.asana.com/api/1.0/projects/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${asanaAccessToken}`,
        'Accept': 'application/json'
      }
    })

    const projectData = await projectResponse.json()
    
    if (!projectResponse.ok) {
      console.error('Asana API error fetching project:', projectData)
      throw new Error(projectData.errors?.[0]?.message || 'Failed to fetch project details')
    }

    const workspaceGid = projectData.data.workspace.gid
    console.log('Found workspace GID:', workspaceGid)

    // Now fetch users from the workspace
    const response = await fetch(`https://app.asana.com/api/1.0/workspaces/${workspaceGid}/users`, {
      headers: {
        'Authorization': `Bearer ${asanaAccessToken}`,
        'Accept': 'application/json'
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Asana API error:', data)
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch Asana users')
    }

    console.log('Successfully fetched Asana users:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-asana-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})