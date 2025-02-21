
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Asana } from "https://esm.sh/asana@1.0.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Asana workspace fetch...')
    
    const client = Asana.Client.create({
      defaultHeaders: { 'Asana-Enable': 'new_project_templates,new_user_task_lists' },
      logAsanaChangeWarnings: false
    }).useAccessToken(Deno.env.get('ASANA_ACCESS_TOKEN'))

    // جلب معرف مساحة العمل من المتغيرات البيئية
    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')
    console.log('Workspace ID:', workspaceId)

    // جلب جميع المحافظ في مساحة العمل
    const portfolios = await client.portfolios.findByWorkspace(workspaceId, {
      opt_fields: 'name,gid,created_at,color,owner,workspace'
    })
    console.log('All portfolios in workspace:', portfolios.data)

    // البحث عن محفظة محددة
    const planningPortfolio = portfolios.data.find(p => p.name === 'وحدة التخطيط والجودة')
    if (planningPortfolio) {
      console.log('Found Planning Portfolio:', planningPortfolio)
    } else {
      console.log('Planning Portfolio not found in workspace')
    }

    return new Response(JSON.stringify({ 
      portfolios: portfolios.data,
      planningPortfolioFound: !!planningPortfolio 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error fetching workspace:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
