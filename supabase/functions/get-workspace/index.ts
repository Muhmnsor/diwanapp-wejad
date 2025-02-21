
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Asana } from "https://esm.sh/asana@1.0.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Asana workspace sync...')
    
    const client = Asana.Client.create({
      defaultHeaders: { 'Asana-Enable': 'new_project_templates,new_user_task_lists' },
      logAsanaChangeWarnings: false
    }).useAccessToken(Deno.env.get('ASANA_ACCESS_TOKEN'))

    // التحقق من وجود معرف مساحة العمل
    const workspaceId = req.url.includes('workspaceId=') 
      ? new URL(req.url).searchParams.get('workspaceId')
      : Deno.env.get('ASANA_WORKSPACE_ID')

    if (!workspaceId) {
      throw new Error('No workspace ID provided')
    }

    console.log('Using workspace ID:', workspaceId)

    // جلب معلومات المحفظة من Asana
    const portfoliosResponse = await client.portfolios.findByWorkspace(workspaceId, {
      opt_fields: 'name,gid,color,owner,custom_field_settings,custom_fields,created_at,modified_at,workspace,permalink_url'
    })

    console.log('Fetched portfolios:', portfoliosResponse.data)

    // إنشاء عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // تحديث أو إنشاء المحافظ في قاعدة البيانات
    for (const portfolio of portfoliosResponse.data) {
      const { data: existingPortfolio, error: checkError } = await supabaseClient
        .from('portfolios')
        .select('*')
        .eq('asana_gid', portfolio.gid)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking portfolio:', checkError)
        continue
      }

      if (!existingPortfolio) {
        const { data: newPortfolio, error: insertError } = await supabaseClient
          .from('portfolios')
          .insert([{
            name: portfolio.name,
            asana_gid: portfolio.gid,
            sync_enabled: true,
          }])
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting portfolio:', insertError)
          continue
        }

        console.log('Created new portfolio:', newPortfolio)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workspace synced successfully',
        portfolios: portfoliosResponse.data
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in workspace sync:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
