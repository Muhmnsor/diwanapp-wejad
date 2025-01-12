import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { departmentId, action } = await req.json();
    
    if (!departmentId) {
      throw new Error('Department ID is required');
    }

    console.log(`Processing Asana sync for department ${departmentId}, action: ${action}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get department sync settings
    const { data: syncStatus, error: syncError } = await supabase
      .from('sync_status')
      .select('*')
      .eq('department_id', departmentId)
      .single();

    if (syncError) {
      throw syncError;
    }

    if (!syncStatus.sync_enabled && action !== 'force') {
      return new Response(
        JSON.stringify({ message: 'Sync is disabled for this department' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get department Asana details
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single();

    if (deptError) {
      throw deptError;
    }

    if (!department.asana_gid || !department.asana_folder_gid) {
      throw new Error('Department is not configured for Asana sync');
    }

    // Perform sync operations
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN');
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Asana access token not configured');
    }

    const headers = {
      'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Sync tasks
    const tasksResponse = await fetch(
      `https://app.asana.com/api/1.0/projects/${department.asana_gid}/tasks`,
      { headers }
    );

    const tasksData = await tasksResponse.json();

    // Process each task
    for (const task of tasksData.data) {
      // Update or create task in Supabase
      const { error: taskError } = await supabase
        .from('project_tasks')
        .upsert({
          asana_gid: task.gid,
          title: task.name,
          description: task.notes,
          status: task.completed ? 'completed' : 'pending',
          due_date: task.due_on
        });

      if (taskError) {
        console.error('Error syncing task:', taskError);
      }

      // Sync comments if enabled
      if (syncStatus.sync_comments) {
        const commentsResponse = await fetch(
          `https://app.asana.com/api/1.0/tasks/${task.gid}/stories`,
          { headers }
        );
        const commentsData = await commentsResponse.json();

        for (const comment of commentsData.data) {
          if (comment.type === 'comment') {
            const { error: commentError } = await supabase
              .from('task_comments')
              .upsert({
                asana_gid: comment.gid,
                task_id: task.gid,
                content: comment.text
              });

            if (commentError) {
              console.error('Error syncing comment:', commentError);
            }
          }
        }
      }

      // Sync attachments if enabled
      if (syncStatus.sync_attachments) {
        const attachmentsResponse = await fetch(
          `https://app.asana.com/api/1.0/tasks/${task.gid}/attachments`,
          { headers }
        );
        const attachmentsData = await attachmentsResponse.json();

        for (const attachment of attachmentsData.data) {
          const { error: attachmentError } = await supabase
            .from('task_attachments')
            .upsert({
              asana_gid: attachment.gid,
              task_id: task.gid,
              file_name: attachment.name,
              file_url: attachment.download_url
            });

          if (attachmentError) {
            console.error('Error syncing attachment:', attachmentError);
          }
        }
      }
    }

    // Update last sync time
    const { error: updateError } = await supabase
      .from('sync_status')
      .update({ last_sync: new Date().toISOString() })
      .eq('department_id', departmentId);

    if (updateError) {
      console.error('Error updating sync status:', updateError);
    }

    return new Response(
      JSON.stringify({ message: 'Sync completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Asana sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});