import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Asana portfolios sync...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaToken) {
      throw new Error('Asana access token not configured')
    }

    // First get user's workspaces
    const workspacesResponse = await fetch('https://app.asana.com/api/1.0/workspaces', {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!workspacesResponse.ok) {
      throw new Error(`Failed to fetch workspaces: ${workspacesResponse.statusText}`)
    }

    const workspaces = await workspacesResponse.json()
    const workspaceId = workspaces.data[0].gid

    // Fetch all portfolios from Asana
    const portfoliosResponse = await fetch(`https://app.asana.com/api/1.0/portfolios?workspace=${workspaceId}&opt_fields=gid,name,color,created_at,owner,permalink_url`, {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!portfoliosResponse.ok) {
      throw new Error(`Failed to fetch portfolios: ${portfoliosResponse.statusText}`)
    }

    const asanaPortfolios = await portfoliosResponse.json()
    console.log('Fetched portfolios from Asana:', asanaPortfolios)

    // Get existing portfolios from Supabase
    const { data: existingPortfolios, error: fetchError } = await supabaseClient
      .from('portfolios')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    // Create a map of Asana GIDs to portfolio data
    const asanaPortfoliosMap = new Map(
      asanaPortfolios.data.map((p: any) => [p.gid, p])
    )

    // Create a map of existing portfolio Asana GIDs
    const existingPortfoliosMap = new Map(
      existingPortfolios?.map(p => [p.asana_gid, p]) || []
    )

    // Sync portfolios
    for (const asanaPortfolio of asanaPortfolios.data) {
      if (!existingPortfoliosMap.has(asanaPortfolio.gid)) {
        // Portfolio exists in Asana but not in Supabase - create it
        const { error: insertError } = await supabaseClient
          .from('portfolios')
          .insert({
            name: asanaPortfolio.name,
            asana_gid: asanaPortfolio.gid,
            description: null
          })

        if (insertError) {
          console.error('Error inserting portfolio:', insertError)
        }
      }
    }

    // Check for portfolios that exist in Supabase but not in Asana
    for (const [asanaGid, portfolio] of existingPortfoliosMap) {
      if (asanaGid && !asanaPortfoliosMap.has(asanaGid)) {
        // Portfolio exists in Supabase but not in Asana - delete it
        const { error: deleteError } = await supabaseClient
          .from('portfolios')
          .delete()
          .eq('id', portfolio.id)

        if (deleteError) {
          console.error('Error deleting portfolio:', deleteError)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Portfolios synced successfully',
        asanaCount: asanaPortfolios.data.length,
        localCount: existingPortfolios?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in sync process:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})