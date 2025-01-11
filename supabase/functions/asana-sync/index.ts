import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AsanaTask {
  gid: string;
  name: string;
  notes: string;
  completed: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing Asana access token')
    }

    const { action, departmentId } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (action === 'sync') {
      console.log('Starting Asana sync for department:', departmentId)

      // Get department details
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departmentId)
        .single()

      if (deptError) throw deptError

      if (!department.asana_gid) {
        throw new Error('Department has no Asana workspace ID')
      }

      // Fetch tasks from Asana
      const asanaResponse = await fetch(
        `https://app.asana.com/api/1.0/projects/${department.asana_gid}/tasks?opt_fields=gid,name,notes,completed`,
        {
          headers: {
            'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!asanaResponse.ok) {
        throw new Error(`Asana API error: ${await asanaResponse.text()}`)
      }

      const asanaTasks = (await asanaResponse.json()).data as AsanaTask[]
      console.log('Fetched tasks from Asana:', asanaTasks.length)

      // Update local tasks
      for (const asanaTask of asanaTasks) {
        const { data: existingTask, error: findError } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('asana_gid', asanaTask.gid)
          .maybeSingle()

        if (findError) throw findError

        const status = asanaTask.completed ? 'completed' : 'in_progress'

        if (existingTask) {
          // Update existing task
          const { error: updateError } = await supabase
            .from('project_tasks')
            .update({
              title: asanaTask.name,
              description: asanaTask.notes,
              status,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTask.id)

          if (updateError) throw updateError
        } else {
          // Create new task
          const { error: insertError } = await supabase
            .from('project_tasks')
            .insert({
              title: asanaTask.name,
              description: asanaTask.notes,
              status,
              asana_gid: asanaTask.gid
            })

          if (insertError) throw insertError
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Sync completed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error in asana-sync function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})