import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { name, notes } = await req.json()
    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    
    if (!asanaToken) {
      throw new Error('Asana access token not configured')
    }

    console.log('Creating Asana portfolio:', { name, notes })

    // First get user's workspaces
    const workspacesResponse = await fetch('https://app.asana.com/api/1.0/workspaces', {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!workspacesResponse.ok) {
      const error = await workspacesResponse.text()
      console.error('Asana workspaces API error:', error)
      throw new Error(`Asana workspaces API error: ${workspacesResponse.statusText}`)
    }

    const workspaces = await workspacesResponse.json()
    console.log('Available workspaces:', workspaces)

    if (!workspaces.data || workspaces.data.length === 0) {
      throw new Error('No workspaces found in Asana account')
    }

    // Use the first workspace
    const workspaceId = workspaces.data[0].gid
    console.log(`Using workspace ID: ${workspaceId}`)

    // Create portfolio in Asana
    const portfolioResponse = await fetch(`https://app.asana.com/api/1.0/portfolios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name,
          workspace: workspaceId,
          color: 'light-green',
          notes
        }
      })
    })

    if (!portfolioResponse.ok) {
      const error = await portfolioResponse.text()
      console.error('Asana portfolio creation error:', error)
      throw new Error(`Asana portfolio creation failed: ${portfolioResponse.statusText}`)
    }

    const portfolio = await portfolioResponse.json()
    console.log('Created Asana portfolio:', portfolio)

    return new Response(
      JSON.stringify(portfolio.data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in create-asana-portfolio:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})