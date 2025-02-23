import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface AsanaTask {
  gid: string;
  name: string;
  notes: string;
  completed: boolean;
  due_on: string | null;
  assignee: {
    gid: string;
  } | null;
}

// Utility function for retrying failed requests
const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      console.log(`Retrying request, ${retries} attempts remaining`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying... ${retries} attempts remaining`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// Fetch tasks list from a project
const fetchProjectTasks = async (projectId: string, accessToken: string): Promise<AsanaTask[]> => {
  console.log('🔄 Fetching tasks list from project:', projectId);
  
  const tasksResponse = await fetchWithRetry(
    `https://app.asana.com/api/1.0/projects/${projectId}/tasks`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!tasksResponse.ok) {
    const errorText = await tasksResponse.text();
    console.error('❌ Error fetching tasks list:', errorText);
    throw new Error(`Asana API error: ${errorText}`);
  }

  const tasksData = await tasksResponse.json();
  console.log('✅ Successfully fetched tasks list:', tasksData.data.length, 'tasks');
  return tasksData.data;
}

// Fetch detailed information for a single task
const fetchTaskDetails = async (taskId: string, accessToken: string): Promise<AsanaTask> => {
  console.log('🔄 Fetching details for task:', taskId);
  
  const taskResponse = await fetchWithRetry(
    `https://app.asana.com/api/1.0/tasks/${taskId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!taskResponse.ok) {
    console.error('❌ Error fetching task details:', taskId);
    throw new Error(`Failed to fetch task details for ${taskId}`);
  }

  const taskData = await taskResponse.json();
  console.log('✅ Successfully fetched task details:', taskData.data.name);
  return taskData.data;
}

// Process tasks and format them for our database
const processTasksData = (tasks: AsanaTask[]): any[] => {
  return tasks.map(task => ({
    gid: task.gid,
    name: task.name,
    notes: task.notes,
    completed: task.completed,
    due_date: task.due_on,
    assignee: task.assignee,
    priority: 'medium', // Default priority since Asana doesn't have this built-in
  }));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId } = await req.json();
    console.log('📥 Received request for workspace:', workspaceId);

    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN');
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing Asana access token');
    }

    // 1. Fetch all tasks from the workspace
    const tasksList = await fetchProjectTasks(workspaceId, ASANA_ACCESS_TOKEN);
    
    // 2. Fetch detailed information for each task
    const taskDetailsPromises = tasksList.map(task => 
      fetchTaskDetails(task.gid, ASANA_ACCESS_TOKEN)
    );
    
    const tasksDetails = await Promise.all(taskDetailsPromises);
    
    // 3. Process and format the tasks data
    const processedTasks = processTasksData(tasksDetails);
    
    console.log('✅ Successfully processed all tasks:', processedTasks.length, 'tasks');
    
    return new Response(
      JSON.stringify({ tasks: processedTasks }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in get-workspace function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})