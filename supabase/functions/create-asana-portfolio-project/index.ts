import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioId, projectData } = await req.json()

    // Get portfolio details from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: portfolio, error: portfolioError } = await supabaseClient
      .from('portfolios')
      .select('asana_gid, asana_workspace_id')
      .eq('id', portfolioId)
      .single()

    if (portfolioError) throw portfolioError

    // Create project in Asana
    const asanaResponse = await fetch('https://app.asana.com/api/1.0/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ASANA_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name: projectData.title,
          notes: projectData.description,
          workspace: portfolio.asana_workspace_id,
          team: portfolio.asana_gid,
          due_date: projectData.dueDate,
          start_date: projectData.startDate,
          status: projectData.status,
          priority: projectData.priority
        }
      })
    })

    if (!asanaResponse.ok) {
      throw new Error(`Asana API error: ${asanaResponse.statusText}`)
    }

    const asanaData = await asanaResponse.json()

    // Update portfolio project with Asana GID
    const { error: updateError } = await supabaseClient
      .from('portfolio_projects')
      .update({ asana_gid: asanaData.data.gid })
      .eq('project_id', projectData.id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})