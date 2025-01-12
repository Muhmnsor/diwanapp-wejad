import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { asana_gid } = await req.json()
    console.log('Deleting Asana portfolio with GID:', asana_gid)

    if (!asana_gid) {
      throw new Error('No Asana GID provided')
    }

    const asanaToken = Deno.env.get('ASANA_ACCESS_TOKEN')
    if (!asanaToken) {
      throw new Error('Asana access token not configured')
    }

    // Delete portfolio in Asana
    const deleteResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${asana_gid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Accept': 'application/json'
      }
    })

    if (!deleteResponse.ok) {
      const error = await deleteResponse.text()
      console.error('Asana API error:', error)
      throw new Error(`Failed to delete portfolio in Asana: ${deleteResponse.statusText}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})