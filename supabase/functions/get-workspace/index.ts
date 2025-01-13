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
      console.error('Asana access token not configured')
      throw new Error('Asana access token not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First get the workspace ID from Asana
    console.log('Fetching Asana workspaces...')
    const workspacesResponse = await fetch(
      'https://app.asana.com/api/1.0/workspaces', 
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!workspacesResponse.ok) {
      const errorText = await workspacesResponse.text()
      console.error('Error fetching workspaces:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const workspacesData = await workspacesResponse.json()
    console.log('Workspaces data:', workspacesData)

    if (!workspacesData.data || workspacesData.data.length === 0) {
      throw new Error('No workspaces found in Asana')
    }

    // Use the first workspace
    const workspace = workspacesData.data[0]
    console.log('Using workspace:', workspace)

    // Then get portfolios for this workspace
    console.log('Fetching portfolios for workspace:', workspace.gid)
    const portfoliosResponse = await fetch(
      `https://app.asana.com/api/1.0/portfolios?workspace=${workspace.gid}&opt_fields=name,color,created_at,current_status,due_on,members,owner,permalink_url,public,start_on,workspace,gid,resource_type,custom_fields,custom_field_settings,workspace_name,html_notes`, 
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!portfoliosResponse.ok) {
      const errorText = await portfoliosResponse.text()
      console.error('Error response from Asana:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const portfoliosData = await portfoliosResponse.json()
    console.log('Successfully fetched portfolios from Asana:', portfoliosData)

    if (!portfoliosData.data) {
      console.error('No data returned from Asana')
      throw new Error('No data returned from Asana')
    }

    // Delete all existing portfolios that are synced from Asana
    console.log('Deleting existing Asana-synced portfolios...')
    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .not('asana_gid', 'is', null)

    if (deleteError) {
      console.error('Error deleting old portfolios:', deleteError)
      throw deleteError
    }

    // For each portfolio from Asana
    console.log('Inserting new portfolios...')
    for (const portfolio of portfoliosData.data) {
      const portfolioData = {
        name: portfolio.name,
        description: portfolio.html_notes || portfolio.current_status?.text || '',
        asana_gid: portfolio.gid,
        asana_sync_enabled: true,
        created_at: new Date(portfolio.created_at).toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('portfolios')
        .insert(portfolioData)

      if (insertError) {
        console.error('Error inserting portfolio:', insertError, portfolioData)
        throw insertError
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