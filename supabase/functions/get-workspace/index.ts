import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Asana access token not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { workspaceId } = await req.json()
    console.log('Fetching workspace details for ID:', workspaceId)

    // First get portfolios from Asana
    const portfoliosResponse = await fetch(`https://app.asana.com/api/1.0/portfolios?workspace=${workspaceId}&opt_fields=name,color,created_at,current_status,due_on,members,owner,permalink_url,public,start_on,workspace,gid,resource_type,custom_fields,custom_field_settings,workspace_name,html_notes`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!portfoliosResponse.ok) {
      console.error('Error fetching portfolios:', await portfoliosResponse.text())
      throw new Error('فشل في جلب المحافظ من Asana')
    }

    const portfoliosData = await portfoliosResponse.json()
    console.log('Asana portfolios:', portfoliosData)

    // Delete all existing portfolios that are synced from Asana
    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .not('asana_gid', 'is', null)

    if (deleteError) {
      console.error('Error deleting old portfolios:', deleteError)
      throw deleteError
    }

    // For each portfolio from Asana
    for (const portfolio of portfoliosData.data) {
      const portfolioData = {
        name: portfolio.name,
        description: portfolio.html_notes || portfolio.current_status?.text || '',
        asana_gid: portfolio.gid,
        asana_sync_enabled: true,
        created_at: new Date(portfolio.created_at).toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert new portfolio
      const { error: insertError } = await supabase
        .from('portfolios')
        .insert(portfolioData)

      if (insertError) {
        console.error('Error inserting portfolio:', insertError)
      }
    }

    // Get updated portfolios from database
    const { data: updatedPortfolios, error: dbError } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Error fetching updated portfolios:', dbError)
      throw dbError
    }

    console.log('Successfully synced portfolios:', updatedPortfolios)
    return new Response(
      JSON.stringify({
        portfolios: updatedPortfolios
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-workspace function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})