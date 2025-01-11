import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AsanaRequest {
  action: 'getFolder' | 'createFolder' | 'getWorkspace' | 'getFolderProjects' | 'createProject' | 'createTask' | 'updateTask';
  folderId?: string;
  workspaceId?: string;
  folderName?: string;
  projectName?: string;
  projectNotes?: string;
  taskName?: string;
  taskNotes?: string;
  taskStatus?: string;
  projectId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN');
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('ASANA_ACCESS_TOKEN is not configured');
    }

    const { action, folderId, workspaceId, folderName, projectName, projectNotes, taskName, taskNotes, taskStatus, projectId } = 
      await req.json() as AsanaRequest;
    
    const baseUrl = 'https://app.asana.com/api/1.0';
    
    const headers = {
      'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...corsHeaders
    };

    let response;
    console.log(`Processing Asana API request: ${action}`);

    switch (action) {
      // الوظائف الحالية
      case 'getWorkspace':
        response = await fetch(`${baseUrl}/workspaces`, {
          headers
        });
        break;

      case 'getFolder':
        if (!folderId) throw new Error('Folder ID is required');
        response = await fetch(`${baseUrl}/portfolios/${folderId}`, {
          headers
        });
        break;

      case 'createFolder':
        if (!workspaceId || !folderName) {
          throw new Error('Workspace ID and folder name are required');
        }
        response = await fetch(`${baseUrl}/portfolios`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              name: folderName,
              workspace: workspaceId,
              resource_type: 'portfolio'
            }
          })
        });
        break;

      case 'getFolderProjects':
        if (!folderId) throw new Error('Folder ID is required');
        response = await fetch(`${baseUrl}/portfolios/${folderId}/items`, {
          headers
        });
        break;

      // وظائف جديدة للتزامن
      case 'createProject':
        if (!folderId || !projectName) {
          throw new Error('Folder ID and project name are required');
        }
        response = await fetch(`${baseUrl}/projects`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              name: projectName,
              notes: projectNotes,
              workspace: workspaceId,
              team: folderId
            }
          })
        });
        break;

      case 'createTask':
        if (!projectId || !taskName) {
          throw new Error('Project ID and task name are required');
        }
        response = await fetch(`${baseUrl}/tasks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              name: taskName,
              notes: taskNotes,
              projects: [projectId]
            }
          })
        });
        break;

      case 'updateTask':
        if (!taskStatus) {
          throw new Error('Task status is required');
        }
        response = await fetch(`${baseUrl}/tasks/${taskId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            data: {
              completed: taskStatus === 'completed'
            }
          })
        });
        break;

      default:
        throw new Error('Invalid action');
    }

    const data = await response.json();
    console.log(`Asana API response for ${action}:`, data);

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error in Asana API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});