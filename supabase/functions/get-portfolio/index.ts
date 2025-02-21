
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Asana } from "https://esm.sh/asana@1.0.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Hello from get-portfolio function!')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { portfolioId } = await req.json()
    console.log('Getting portfolio details for:', portfolioId)

    const client = Asana.Client.create({
      defaultHeaders: { 'Asana-Enable': 'new_project_templates,new_user_task_lists' },
      logAsanaChangeWarnings: false
    }).useAccessToken(Deno.env.get('ASANA_ACCESS_TOKEN'))

    // جلب تفاصيل المحفظة من Asana
    const portfolio = await client.portfolios.findById(portfolioId)
    console.log('Portfolio details:', portfolio)

    // جلب جميع المشاريع في المحفظة
    const items = await client.portfolios.getItems(portfolioId, {
      opt_fields: 'name,gid,resource_type,start_on,due_on,completed,owner,notes,status'
    })
    console.log('Portfolio items:', items)

    // دمج المعلومات
    const portfolioData = {
      ...portfolio,
      items: items.data
    }

    console.log('Final portfolio data:', portfolioData)

    return new Response(JSON.stringify(portfolioData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in get-portfolio:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
