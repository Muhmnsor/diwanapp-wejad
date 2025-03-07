
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RequestBody {
  workspaceId: string;
  userId: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the service role client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const { workspaceId, userId } = await req.json() as RequestBody

    console.log(`Deleting workspace ${workspaceId} for user ${userId}`)

    if (!workspaceId || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'معلومات غير مكتملة' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check permissions
    console.log('Checking user permissions...')
    
    // Check if user is the creator
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('created_by')
      .eq('id', workspaceId)
      .single()

    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError)
      return new Response(
        JSON.stringify({ success: false, error: 'لم يتم العثور على مساحة العمل' }),
        { headers: { 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const isCreator = workspace.created_by === userId
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', userId)
      .single()

    let isAdmin = false
    if (roleData?.roles) {
      if (typeof roleData.roles === 'object' && !Array.isArray(roleData.roles)) {
        isAdmin = (roleData.roles as { name: string }).name === 'admin'
      } else if (Array.isArray(roleData.roles)) {
        isAdmin = roleData.roles.some((role: any) => 
          role && typeof role === 'object' && role.name === 'admin'
        )
      }
    }
    
    // Check if user is workspace admin
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single()

    const isWorkspaceAdmin = memberData !== null
    
    if (!isCreator && !isAdmin && !isWorkspaceAdmin) {
      console.error('User lacks permission to delete workspace')
      return new Response(
        JSON.stringify({ success: false, error: 'ليس لديك صلاحية لحذف مساحة العمل' }),
        { headers: { 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Call the database function to delete the workspace
    console.log('Calling database function to delete workspace...')
    const { data, error } = await supabaseAdmin.rpc(
      'delete_workspace',
      { 
        p_workspace_id: workspaceId,
        p_user_id: userId 
      }
    )

    if (error) {
      console.error('Error deleting workspace:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Workspace deleted successfully')
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'خطأ غير متوقع أثناء حذف مساحة العمل' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
