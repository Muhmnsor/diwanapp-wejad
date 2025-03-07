
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { workspaceId, userId } = await req.json();
    
    console.log("Received delete request for workspace:", workspaceId, "from user:", userId);
    
    if (!workspaceId || !userId) {
      console.error("Missing required parameters:", { workspaceId, userId });
      return new Response(
        JSON.stringify({ success: false, error: 'معرّف مساحة العمل ومعرّف المستخدم مطلوبان' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ success: false, error: 'خطأ في تكوين الخادم' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Attempting to delete workspace with parameters:", {
      workspaceId,
      userId
    });
    
    // First try to get the workspace to confirm it exists
    const { data: workspace, error: fetchError } = await supabase
      .from('workspaces')
      .select('id, name, created_by')
      .eq('id', workspaceId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching workspace:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'لم يتم العثور على مساحة العمل' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Check permissions directly here as a double-check
    let hasPermission = workspace.created_by === userId;
    
    if (!hasPermission) {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('roles:role_id(name)')
        .eq('user_id', userId)
        .single();
        
      const isAdmin = roleData?.roles && 
        (typeof roleData.roles === 'object' && !Array.isArray(roleData.roles) 
          ? (roleData.roles as { name: string }).name === 'admin' 
          : Array.isArray(roleData.roles) && roleData.roles.some(role => 
              role && typeof role === 'object' && role.name === 'admin'
            ));
            
      if (isAdmin) {
        hasPermission = true;
      } else {
        // Check if user is workspace admin
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select()
          .eq('workspace_id', workspaceId)
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();
          
        hasPermission = !!memberData;
      }
    }
    
    if (!hasPermission) {
      console.error("Permission denied for user:", userId);
      return new Response(
        JSON.stringify({ success: false, error: 'ليس لديك صلاحية لحذف مساحة العمل' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 403 }
      );
    }
    
    console.log("Permission check passed, proceeding with deletion");
    
    // Begin a transaction to ensure data consistency
    // First delete the workspace members
    const { error: membersError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (membersError) {
      console.error("Error deleting workspace members:", membersError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ أثناء حذف أعضاء مساحة العمل',
          details: membersError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Get projects in workspace
    const { data: projects, error: projectsError } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('workspace_id', workspaceId);
      
    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ أثناء جلب المشاريع',
          details: projectsError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
      
    if (projects && projects.length > 0) {
      console.log(`Found ${projects.length} projects to delete`);
      
      for (const project of projects) {
        // For each project, delete tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('project_id', project.id);
          
        if (tasksError) {
          console.error("Error fetching tasks for project:", project.id, tasksError);
          continue; // Try to continue with other projects
        }
          
        if (tasks && tasks.length > 0) {
          console.log(`Found ${tasks.length} tasks to delete for project ${project.id}`);
          const taskIds = tasks.map(t => t.id);
          
          // Delete related task records
          try {
            // Delete task attachments
            const { error: attachmentsError } = await supabase
              .from('task_attachments')
              .delete()
              .in('task_id', taskIds);
              
            if (attachmentsError) {
              console.error("Error deleting task attachments:", attachmentsError);
            }
            
            // Delete task comments
            const { error: commentsError } = await supabase
              .from('task_comments')
              .delete()
              .in('task_id', taskIds);
              
            if (commentsError) {
              console.error("Error deleting task comments:", commentsError);
            }
            
            // Delete unified task comments
            const { error: unifiedCommentsError } = await supabase
              .from('unified_task_comments')
              .delete()
              .in('task_id', taskIds);
              
            if (unifiedCommentsError) {
              console.error("Error deleting unified task comments:", unifiedCommentsError);
            }
            
            // Delete subtasks
            const { error: subtasksError } = await supabase
              .from('subtasks')
              .delete()
              .in('task_id', taskIds);
              
            if (subtasksError) {
              console.error("Error deleting subtasks:", subtasksError);
            }
            
            // Delete the tasks
            const { error: tasksDeleteError } = await supabase
              .from('tasks')
              .delete()
              .in('id', taskIds);
              
            if (tasksDeleteError) {
              console.error("Error deleting tasks:", tasksDeleteError);
            }
          } catch (error) {
            console.error("Error in task deletion process:", error);
          }
        }
        
        // Delete project stages
        const { error: stagesError } = await supabase
          .from('project_stages')
          .delete()
          .eq('project_id', project.id);
          
        if (stagesError) {
          console.error("Error deleting project stages:", stagesError);
        }
      }
      
      // Delete all projects
      const { error: projectsDeleteError } = await supabase
        .from('project_tasks')
        .delete()
        .eq('workspace_id', workspaceId);
        
      if (projectsDeleteError) {
        console.error("Error deleting projects:", projectsDeleteError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'حدث خطأ أثناء حذف المشاريع',
            details: projectsDeleteError
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }
    }
    
    // Delete standalone tasks
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (tasksError) {
      console.error("Error deleting workspace tasks:", tasksError);
      // Continue with deletion attempt
    }
    
    // Finally delete the workspace
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);
      
    if (deleteError) {
      console.error("Error deleting workspace:", deleteError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: deleteError.message || 'فشل في حذف مساحة العمل',
          details: deleteError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    console.log("Workspace deleted successfully");
    return new Response(
      JSON.stringify({ success: true, message: 'تم حذف مساحة العمل بنجاح' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ غير متوقع',
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
