
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
      p_workspace_id: workspaceId,
      p_user_id: userId
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
      return new Response(
        JSON.stringify({ success: false, error: 'ليس لديك صلاحية لحذف مساحة العمل' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 403 }
      );
    }
    
    console.log("Permission check passed, proceeding with deletion");
    
    // Use a transaction to delete workspace and related data
    // First delete the workspace members
    const { error: membersError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (membersError) {
      console.error("Error deleting workspace members:", membersError);
    }
    
    // Get projects in workspace
    const { data: projects } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('workspace_id', workspaceId);
      
    if (projects && projects.length > 0) {
      for (const project of projects) {
        // For each project, delete tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .eq('project_id', project.id);
          
        if (tasks && tasks.length > 0) {
          const taskIds = tasks.map(t => t.id);
          
          // Delete related task records
          await Promise.all([
            supabase.from('task_discussion_attachments').delete().in('task_id', taskIds),
            supabase.from('task_templates').delete().in('task_id', taskIds),
            supabase.from('task_attachments').delete().in('task_id', taskIds),
            supabase.from('task_comments').delete().in('task_id', taskIds),
            supabase.from('unified_task_comments').delete().in('task_id', taskIds),
            supabase.from('task_history').delete().in('task_id', taskIds),
            supabase.from('task_deliverables').delete().in('task_id', taskIds),
            supabase.from('subtasks').delete().in('task_id', taskIds)
          ]);
          
          // Delete the tasks
          await supabase.from('tasks').delete().in('id', taskIds);
        }
        
        // Delete project stages
        await supabase.from('project_stages').delete().eq('project_id', project.id);
      }
      
      // Delete all projects
      await supabase.from('project_tasks').delete().eq('workspace_id', workspaceId);
    }
    
    // Delete standalone tasks
    await supabase.from('tasks').delete().eq('workspace_id', workspaceId);
    
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
