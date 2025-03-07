
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("[delete-workspace] Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestBody = await req.json();
    const { workspaceId, userId } = requestBody;
    
    console.log("[delete-workspace] Request received:", {
      time: new Date().toISOString(),
      workspaceId,
      userId,
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers)
    });
    
    if (!workspaceId || !userId) {
      console.error("[delete-workspace] Missing required parameters:", { workspaceId, userId });
      return new Response(
        JSON.stringify({ success: false, error: 'معرّف مساحة العمل ومعرّف المستخدم مطلوبان' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[delete-workspace] Missing environment variables");
      return new Response(
        JSON.stringify({ success: false, error: 'خطأ في تكوين الخادم' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[delete-workspace] Attempting to delete workspace:", workspaceId, "by user:", userId);
    
    // First try to get the workspace to confirm it exists
    console.log("[delete-workspace] Checking if workspace exists");
    const { data: workspace, error: fetchError } = await supabase
      .from('workspaces')
      .select('id, name, created_by')
      .eq('id', workspaceId)
      .single();
      
    if (fetchError) {
      console.error("[delete-workspace] Error fetching workspace:", fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على مساحة العمل',
          details: fetchError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Check permissions directly here as a double-check
    console.log("[delete-workspace] Checking user permissions");
    console.log("[delete-workspace] Workspace creator:", workspace.created_by);
    console.log("[delete-workspace] Requesting user:", userId);
    
    let hasPermission = workspace.created_by === userId;
    
    if (!hasPermission) {
      console.log("[delete-workspace] User is not workspace creator, checking admin role");
      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('roles:role_id(name)')
        .eq('user_id', userId)
        .single();
        
      if (roleError && roleError.code !== 'PGRST116') {
        console.error("[delete-workspace] Error checking user roles:", roleError);
      }
      
      console.log("[delete-workspace] User role data:", roleData);
      
      const isAdmin = roleData?.roles && 
        (typeof roleData.roles === 'object' && !Array.isArray(roleData.roles) 
          ? (roleData.roles as { name: string }).name === 'admin' 
          : Array.isArray(roleData.roles) && roleData.roles.some(role => 
              role && typeof role === 'object' && role.name === 'admin'
            ));
            
      if (isAdmin) {
        console.log("[delete-workspace] User is system admin");
        hasPermission = true;
      } else {
        console.log("[delete-workspace] User is not system admin, checking workspace membership");
        // Check if user is workspace admin
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select()
          .eq('workspace_id', workspaceId)
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();
          
        if (memberError && memberError.code !== 'PGRST116') {
          console.error("[delete-workspace] Error checking workspace membership:", memberError);
        }
        
        console.log("[delete-workspace] Workspace membership data:", memberData);
        hasPermission = !!memberData;
      }
    }
    
    if (!hasPermission) {
      console.error("[delete-workspace] Permission denied for user:", userId);
      return new Response(
        JSON.stringify({ success: false, error: 'ليس لديك صلاحية لحذف مساحة العمل' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 403 }
      );
    }
    
    console.log("[delete-workspace] Permission check passed, proceeding with deletion");
    
    // Execute deletion operations in the reverse order (children before parents)
    // to avoid foreign key constraint issues and deadlocks
    
    // 1. First find projects in this workspace
    console.log("[delete-workspace] Finding projects in workspace");
    const { data: projects, error: projectsError } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('workspace_id', workspaceId);
      
    if (projectsError) {
      console.error("[delete-workspace] Error fetching projects:", projectsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ أثناء جلب المشاريع',
          details: projectsError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // 2. Delete task-related entities first
    if (projects && projects.length > 0) {
      console.log(`[delete-workspace] Found ${projects.length} projects to delete`);
      const projectIds = projects.map(p => p.id);
      
      // Get all tasks for these projects
      console.log("[delete-workspace] Finding tasks for projects:", projectIds);
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .in('project_id', projectIds.map(id => id.toString()));
        
      if (tasksError) {
        console.error("[delete-workspace] Error fetching tasks:", tasksError);
        // Continue with process even if there's an error here
      }
      
      if (tasks && tasks.length > 0) {
        console.log(`[delete-workspace] Found ${tasks.length} tasks to delete`);
        const taskIds = tasks.map(t => t.id);
        
        // 2.1 Delete task-related entities in order (children first)
        try {
          // Delete subtasks first
          console.log("[delete-workspace] Deleting subtasks");
          const { error: subtasksError } = await supabase
            .from('subtasks')
            .delete()
            .in('task_id', taskIds);
            
          if (subtasksError) {
            console.error("[delete-workspace] Error deleting subtasks:", subtasksError);
          } else {
            console.log("[delete-workspace] Successfully deleted subtasks");
          }
          
          // Delete task attachments
          console.log("[delete-workspace] Deleting task attachments");
          const { error: attachmentsError } = await supabase
            .from('task_attachments')
            .delete()
            .in('task_id', taskIds);
            
          if (attachmentsError) {
            console.error("[delete-workspace] Error deleting task attachments:", attachmentsError);
          } else {
            console.log("[delete-workspace] Successfully deleted task attachments");
          }
          
          // Delete task comments
          console.log("[delete-workspace] Deleting task comments");
          const { error: commentsError } = await supabase
            .from('task_comments')
            .delete()
            .in('task_id', taskIds);
            
          if (commentsError) {
            console.error("[delete-workspace] Error deleting task comments:", commentsError);
          } else {
            console.log("[delete-workspace] Successfully deleted task comments");
          }
          
          // Delete unified task comments
          console.log("[delete-workspace] Deleting unified task comments");
          const { error: unifiedCommentsError } = await supabase
            .from('unified_task_comments')
            .delete()
            .in('task_id', taskIds)
            .eq('task_table', 'tasks');
            
          if (unifiedCommentsError) {
            console.error("[delete-workspace] Error deleting unified task comments:", unifiedCommentsError);
          } else {
            console.log("[delete-workspace] Successfully deleted unified task comments");
          }
          
          // Delete task discussion attachments
          console.log("[delete-workspace] Deleting task discussion attachments");
          const { error: discussionAttachmentsError } = await supabase
            .from('task_discussion_attachments')
            .delete()
            .in('task_id', taskIds)
            .eq('task_table', 'tasks');
            
          if (discussionAttachmentsError) {
            console.error("[delete-workspace] Error deleting discussion attachments:", discussionAttachmentsError);
          } else {
            console.log("[delete-workspace] Successfully deleted discussion attachments");
          }
          
          // Delete task templates
          console.log("[delete-workspace] Deleting task templates");
          const { error: templatesError } = await supabase
            .from('task_templates')
            .delete()
            .in('task_id', taskIds);
            
          if (templatesError) {
            console.error("[delete-workspace] Error deleting task templates:", templatesError);
          } else {
            console.log("[delete-workspace] Successfully deleted task templates");
          }
          
          // Delete task history
          console.log("[delete-workspace] Deleting task history");
          const { error: historyError } = await supabase
            .from('task_history')
            .delete()
            .in('task_id', taskIds);
            
          if (historyError) {
            console.error("[delete-workspace] Error deleting task history:", historyError);
          } else {
            console.log("[delete-workspace] Successfully deleted task history");
          }
          
          // Delete task deliverables
          console.log("[delete-workspace] Deleting task deliverables");
          const { error: deliverablesError } = await supabase
            .from('task_deliverables')
            .delete()
            .in('task_id', taskIds)
            .eq('task_table', 'tasks');
            
          if (deliverablesError) {
            console.error("[delete-workspace] Error deleting task deliverables:", deliverablesError);
          } else {
            console.log("[delete-workspace] Successfully deleted task deliverables");
          }
          
          // Finally delete the tasks
          console.log("[delete-workspace] Deleting tasks");
          const { error: tasksDeleteError } = await supabase
            .from('tasks')
            .delete()
            .in('id', taskIds);
            
          if (tasksDeleteError) {
            console.error("[delete-workspace] Error deleting tasks:", tasksDeleteError);
          } else {
            console.log("[delete-workspace] Successfully deleted tasks");
          }
        } catch (error) {
          console.error("[delete-workspace] Error in task deletion process:", error);
          // Continue with the process even if there are errors
        }
      }
      
      // 3. Delete project stages
      console.log("[delete-workspace] Deleting project stages");
      const { error: stagesError } = await supabase
        .from('project_stages')
        .delete()
        .in('project_id', projectIds);
        
      if (stagesError) {
        console.error("[delete-workspace] Error deleting project stages:", stagesError);
      } else {
        console.log("[delete-workspace] Successfully deleted project stages");
      }
      
      // 4. Delete projects
      console.log("[delete-workspace] Deleting projects");
      const { error: projectsDeleteError } = await supabase
        .from('project_tasks')
        .delete()
        .in('id', projectIds);
        
      if (projectsDeleteError) {
        console.error("[delete-workspace] Error deleting projects:", projectsDeleteError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'حدث خطأ أثناء حذف المشاريع',
            details: projectsDeleteError
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      } else {
        console.log("[delete-workspace] Successfully deleted projects");
      }
    }
    
    // 5. Delete standalone tasks
    console.log("[delete-workspace] Deleting standalone tasks");
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (tasksError) {
      console.error("[delete-workspace] Error deleting workspace tasks:", tasksError);
      // Continue with deletion attempt
    } else {
      console.log("[delete-workspace] Successfully deleted standalone tasks");
    }
    
    // 6. Delete workspace members
    console.log("[delete-workspace] Deleting workspace members");
    const { error: membersError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (membersError) {
      console.error("[delete-workspace] Error deleting workspace members:", membersError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'حدث خطأ أثناء حذف أعضاء مساحة العمل',
          details: membersError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    } else {
      console.log("[delete-workspace] Successfully deleted workspace members");
    }
    
    // 7. Finally delete the workspace
    console.log("[delete-workspace] Deleting workspace");
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);
      
    if (deleteError) {
      console.error("[delete-workspace] Error deleting workspace:", deleteError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: deleteError.message || 'فشل في حذف مساحة العمل',
          details: deleteError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    console.log("[delete-workspace] Workspace deleted successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم حذف مساحة العمل بنجاح',
        timestamp: new Date().toISOString(),
        workspaceId: workspaceId
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('[delete-workspace] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ غير متوقع',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
