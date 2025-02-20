
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const asanaAccessToken = Deno.env.get('ASANA_ACCESS_TOKEN')

async function fetchProjectTasks(workspaceId: string) {
  console.log('🔍 Fetching project details from Asana for workspace:', workspaceId)

  try {
    // أولاً نتحقق من وجود المشروع
    const projectResponse = await fetch(`https://app.asana.com/api/1.0/projects/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${asanaAccessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!projectResponse.ok) {
      const errorData = await projectResponse.json()
      console.error('❌ Project verification failed:', errorData)
      throw new Error(`Asana API error: ${JSON.stringify(errorData)}`)
    }

    const projectData = await projectResponse.json()
    console.log('✅ Project verified:', projectData.data.name)

    // ثم نجلب المهام
    const tasksResponse = await fetch(
      `https://app.asana.com/api/1.0/projects/${workspaceId}/tasks?opt_fields=name,notes,due_on,completed,assignee,created_at`, {
        headers: {
          'Authorization': `Bearer ${asanaAccessToken}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!tasksResponse.ok) {
      const errorData = await tasksResponse.json()
      console.error('❌ Tasks fetch failed:', errorData)
      throw new Error(`Asana API error: ${JSON.stringify(errorData)}`)
    }

    const tasksData = await tasksResponse.json()
    console.log(`✅ Successfully fetched ${tasksData.data.length} tasks`)
    return tasksData.data
  } catch (error) {
    console.error('❌ Error in fetchProjectTasks:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workspaceId } = await req.json()
    console.log('📥 Received request for workspace:', workspaceId)

    if (!workspaceId) {
      throw new Error('No workspace ID provided')
    }

    if (!asanaAccessToken) {
      throw new Error('Asana access token not configured')
    }

    const tasks = await fetchProjectTasks(workspaceId)

    return new Response(
      JSON.stringify(tasks),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('❌ Error in get-workspace function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Please verify the workspace ID and Asana access token'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
