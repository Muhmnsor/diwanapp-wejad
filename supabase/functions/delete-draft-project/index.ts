
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2'

// Define cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { projectId, userId } = await req.json()
    
    if (!projectId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Project ID and User ID are required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the project is a draft and check ownership
    const { data: project, error: projectError } = await supabase
      .from('project_tasks')
      .select('id, is_draft, project_manager')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Error fetching project:', projectError)
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      )
    }

    // Check if it's a draft
    if (!project.is_draft) {
      return new Response(
        JSON.stringify({ error: 'This is not a draft project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    // Check if user is an admin (has bypass permissions)
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', userId)

    const isAdmin = userRoles?.some(role => 
      role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
    )

    // Check permission (creator or admin)
    const isCreator = project.project_manager === userId
    
    if (!isCreator && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to delete this project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 403 }
      )
    }

    // Delete related records first using service role
    // Delete project stages
    const { error: stagesError } = await supabase
      .from('project_stages')
      .delete()
      .eq('project_id', projectId)
    
    if (stagesError) {
      console.error('Error deleting project stages:', stagesError)
    }

    // Get task IDs for this project
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('project_id', projectId)

    if (tasks && tasks.length > 0) {
      const taskIds = tasks.map(task => task.id)
      
      // Delete subtasks
      await supabase
        .from('subtasks')
        .delete()
        .in('task_id', taskIds)
      
      // Delete tasks
      await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
    }

    // Finally delete the project
    const { error: deleteError } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete project' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Project deleted successfully' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
