
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

    console.log("Starting workspace deletion process...");
    
    // Log the attempt
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'workspace_delete_attempt',
          details: `محاولة حذف مساحة العمل: ${workspaceId}`
        });
    } catch (logError) {
      console.warn("Failed to log delete attempt:", logError);
      // Continue with the process, this is not critical
    }
    
    // First verify the workspace exists
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, name, created_by')
      .eq('id', workspaceId)
      .single();
      
    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على مساحة العمل',
          details: workspaceError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    if (!workspace) {
      console.error('Workspace not found:', workspaceId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على مساحة العمل' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    console.log("Found workspace:", workspace.name, "- Checking permissions...");
    
    // Check if the user is admin or workspace owner
    const { data: isAdmin } = await supabase
      .rpc('is_admin', { user_id: userId });
      
    const isOwner = workspace.created_by === userId;
    
    const { data: memberRole, error: roleError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
      
    const isWorkspaceAdmin = memberRole?.role === 'admin';
    
    console.log("Permission check:", { 
      isAdmin, 
      isOwner, 
      isWorkspaceAdmin,
      roleError 
    });
    
    if (!isAdmin && !isOwner && !isWorkspaceAdmin) {
      console.error('User does not have permission to delete workspace');
      
      // Log the permission error
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'workspace_delete_denied',
          details: `تم رفض حذف مساحة العمل: ${workspace.name} - ليس لديك صلاحية الحذف`
        });
        
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ليس لديك صلاحية لحذف مساحة العمل' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 403 }
      );
    }

    // First try directly calling delete_workspace with RPC
    console.log("Calling database function to delete workspace...");
    try {
      // Attempt to delete via RPC first (more efficient)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('delete_workspace', { 
          p_workspace_id: workspaceId,
          p_user_id: userId
        });

      if (rpcError) {
        console.error('Error calling delete_workspace function:', rpcError);
        throw rpcError;
      }

      console.log("RPC deletion result:", rpcData);
      
      if (rpcData !== true) {
        console.error('RPC returned unexpected result:', rpcData);
        throw new Error('فشل في حذف مساحة العمل');
      }
      
      // If we got here, deletion was successful
      console.log("Workspace deleted successfully via RPC");
    } catch (rpcError) {
      console.error("RPC delete failed, error:", rpcError);
      
      // RPC failed, let's try manual deletion as fallback
      console.log("Falling back to manual deletion process...");
      
      // Start transaction with manual SQL
      const { data: sqlResult, error: sqlError } = await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: 'workspace_delete_manual',
        details: `بدء عملية الحذف اليدوي لمساحة العمل: ${workspace.name}`
      }).select();
      
      if (sqlError) {
        console.error("Transaction start error:", sqlError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'فشل في بدء عملية الحذف اليدوي',
            details: sqlError
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }
      
      // Return error to client - we don't want to proceed with manual deletion in edge function
      // as it could timeout
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'فشل في استدعاء وظيفة حذف مساحة العمل، يرجى المحاولة مرة أخرى',
          details: rpcError instanceof Error ? rpcError.message : String(rpcError)
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Log workspace deletion event
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'workspace_deleted',
          details: `تم حذف مساحة العمل: ${workspace.name}`
        });
      console.log("Logged workspace deletion activity");
    } catch (logError) {
      console.error("Failed to log workspace deletion:", logError);
      // Continue with the response since the deletion was successful
    }

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
