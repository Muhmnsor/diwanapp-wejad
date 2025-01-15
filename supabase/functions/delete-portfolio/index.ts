import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { portfolioGid } = await req.json()
    console.log('Deleting portfolio from Asana:', portfolioGid)

    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing Asana access token')
    }

    if (!portfolioGid) {
      throw new Error('Portfolio GID is required')
    }

    // Delete portfolio from Asana
    const deleteResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolioGid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json()
      console.error('Failed to delete portfolio in Asana:', error)
      throw new Error('Failed to delete portfolio in Asana')
    }

    console.log('Successfully deleted portfolio from Asana')
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in delete-portfolio function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})