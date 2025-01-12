import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AsanaRequest {
  action: 'getFolder' | 'createFolder' | 'getWorkspace' | 'getFolderProjects';
  folderId?: string;
  workspaceId?: string;
  folderName?: string;
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

    const { action, folderId, workspaceId, folderName } = await req.json() as AsanaRequest;
    const baseUrl = 'https://app.asana.com/api/1.0';
    
    const headers = {
      'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...corsHeaders
    };

    let response;
    console.log(`📡 Processing Asana API request: ${action}`, { workspaceId, folderName, folderId });

    switch (action) {
      case 'createFolder':
        if (!folderName) throw new Error('Folder name is required');
        
        console.log('🔨 Creating portfolio in Asana:', { workspaceId: '1209130949457034', folderName });
        response = await fetch(`${baseUrl}/portfolios`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              name: folderName,
              workspace: '1209130949457034', // Using the fixed workspace ID
              resource_type: 'portfolio'
            }
          })
        });
        break;

      case 'getFolder':
        if (!folderId) throw new Error('Folder ID is required');
        response = await fetch(`${baseUrl}/portfolios/${folderId}`, {
          headers
        });
        break;

      case 'getFolderProjects':
        if (!folderId) throw new Error('Folder ID is required');
        response = await fetch(`${baseUrl}/portfolios/${folderId}/items`, {
          headers
        });
        break;

      default:
        throw new Error('Invalid action');
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Asana API error:', errorData);
      throw new Error(`Asana API error: ${errorData?.errors?.[0]?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Asana API response:', data);

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('❌ Error in Asana API:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});