
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

    console.log("Calling database function to delete workspace with parameters:", {
      p_workspace_id: workspaceId,
      p_user_id: userId
    });
    
    // Call the database function with proper parameters
    const { data, error } = await supabase
      .rpc('delete_workspace', { 
        p_workspace_id: workspaceId,
        p_user_id: userId
      });

    if (error) {
      console.error('Error calling delete_workspace function:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'فشل في حذف مساحة العمل',
          details: error
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    console.log("Deletion result:", data);
    
    if (data !== true) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'فشل في حذف مساحة العمل',
          result: data 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
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
