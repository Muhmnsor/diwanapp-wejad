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
    const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')
    
    if (!ASANA_ACCESS_TOKEN) {
      console.error('❌ Asana access token not configured')
      throw new Error('Asana access token not configured')
    }

    if (!ASANA_WORKSPACE_ID) {
      console.error('❌ Asana workspace ID not configured')
      throw new Error('Asana workspace ID not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Fetching portfolios from Asana workspace:', ASANA_WORKSPACE_ID)
    
    // First get the workspace details
    console.log('🔍 Fetching workspace details...')
    const workspaceResponse = await fetch(
      `https://app.asana.com/api/1.0/workspaces/${ASANA_WORKSPACE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!workspaceResponse.ok) {
      const errorText = await workspaceResponse.text()
      console.error('❌ Error fetching workspace:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const workspaceData = await workspaceResponse.json()
    console.log('✅ Workspace details:', workspaceData)

    // Get portfolios (projects at workspace level)
    console.log('🔍 Fetching workspace projects...')
    const portfoliosResponse = await fetch(
      `https://app.asana.com/api/1.0/workspaces/${ASANA_WORKSPACE_ID}/projects`, 
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!portfoliosResponse.ok) {
      const errorText = await portfoliosResponse.text()
      console.error('❌ Error response from Asana:', errorText)
      throw new Error(`Asana API error: ${errorText}`)
    }

    const portfoliosData = await portfoliosResponse.json()
    console.log('✅ Successfully fetched portfolios from Asana:', portfoliosData)

    if (!portfoliosData.data) {
      console.error('❌ No data returned from Asana')
      throw new Error('No data returned from Asana')
    }

    // Delete all existing portfolios that are synced from Asana
    console.log('🗑️ Deleting existing Asana-synced portfolios...')
    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .not('asana_gid', 'is', null)

    if (deleteError) {
      console.error('❌ Error deleting old portfolios:', deleteError)
      throw deleteError
    }

    // For each portfolio from Asana
    console.log('📝 Inserting new portfolios...')
    for (const portfolio of portfoliosData.data) {
      const portfolioData = {
        name: portfolio.name,
        description: portfolio.notes || '',
        asana_gid: portfolio.gid,
        asana_sync_enabled: true,
        created_at: new Date(portfolio.created_at).toISOString(),
        updated_at: new Date().toISOString(),
        sync_enabled: true,
        last_sync_at: new Date().toISOString(),
        owner_gid: workspaceData.data.gid // Use workspace gid instead of owner
      }

      const { error: insertError } = await supabase
        .from('portfolios')
        .insert(portfolioData)

      if (insertError) {
        console.error('❌ Error inserting portfolio:', insertError, portfolioData)
        throw insertError
      }
    }

    // Get updated portfolios from database
    const { data: updatedPortfolios, error: dbError } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('❌ Error fetching updated portfolios:', dbError)
      throw dbError
    }

    console.log('✅ Successfully synced portfolios:', updatedPortfolios)
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
    console.error('❌ Error in get-workspace function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})