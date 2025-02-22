
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    const workspaceId = Deno.env.get('ASANA_WORKSPACE_ID')

    if (!asanaToken || !workspaceId) {
      throw new Error('Missing required environment variables')
    }

    // 1. جلب المحافظ من Asana
    const portfoliosResponse = await fetch(
      `https://app.asana.com/api/1.0/portfolios?workspace=${workspaceId}&opt_fields=name,gid,color,created_at,modified_at,owner,notes`, 
      {
        headers: {
          'Authorization': `Bearer ${asanaToken}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!portfoliosResponse.ok) {
      const error = await portfoliosResponse.json()
      throw new Error(`Asana API error: ${JSON.stringify(error)}`)
    }

    const { data: portfolios } = await portfoliosResponse.json()

    // 2. جلب المشاريع لكل محفظة
    const portfoliosWithProjects = await Promise.all(
      portfolios.map(async (portfolio: any) => {
        const projectsResponse = await fetch(
          `https://app.asana.com/api/1.0/portfolios/${portfolio.gid}/items?opt_fields=name,gid,notes,status,created_at,modified_at,completed,owner`, 
          {
            headers: {
              'Authorization': `Bearer ${asanaToken}`,
              'Accept': 'application/json'
            }
          }
        )

        if (!projectsResponse.ok) {
          console.error(`Error fetching projects for portfolio ${portfolio.gid}:`, await projectsResponse.text())
          return {
            ...portfolio,
            items: []
          }
        }

        const { data: projects } = await projectsResponse.json()
        return {
          ...portfolio,
          items: projects
        }
      })
    )

    console.log(`✅ Successfully fetched ${portfoliosWithProjects.length} portfolios from Asana`)

    return new Response(
      JSON.stringify(portfoliosWithProjects),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
