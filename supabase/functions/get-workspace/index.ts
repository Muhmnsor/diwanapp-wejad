import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url, options)
    if (!response.ok && retries > 0) {
      console.log(`Retrying request, ${retries} attempts remaining`)
      await sleep(RETRY_DELAY)
      return fetchWithRetry(url, options, retries - 1)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying... ${retries} attempts remaining`)
      await sleep(RETRY_DELAY)
      return fetchWithRetry(url, options, retries - 1)
    }
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

    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing Asana access token')
    }

    // 1. First get the workspace tasks
    console.log('🔄 Fetching tasks from workspace:', workspaceId)
    const tasksResponse = await fetchWithRetry(
      `https://app.asana.com/api/1.0/projects/${workspaceId}/tasks`,
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!tasksResponse.ok) {
      const errorText = await tasksResponse.text()
      console.error('❌ Error fetching tasks:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const tasksData = await tasksResponse.json()
    console.log('✅ Successfully fetched tasks:', tasksData)

    // 2. Get detailed information for each task
    const tasks = []
    for (const task of tasksData.data) {
      console.log('🔄 Fetching details for task:', task.gid)
      const taskResponse = await fetchWithRetry(
        `https://app.asana.com/api/1.0/tasks/${task.gid}`,
        {
          headers: {
            'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!taskResponse.ok) {
        console.error('❌ Error fetching task details:', task.gid)
        continue
      }

      const taskData = await taskResponse.json()
      tasks.push({
        gid: taskData.data.gid,
        name: taskData.data.name,
        notes: taskData.data.notes,
        completed: taskData.data.completed,
        due_date: taskData.data.due_on,
        assignee: taskData.data.assignee,
        priority: 'medium', // Default priority since Asana doesn't have this built-in
      })
    }

    console.log('✅ Successfully processed all tasks')
    return new Response(
      JSON.stringify({ tasks }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in get-workspace function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})