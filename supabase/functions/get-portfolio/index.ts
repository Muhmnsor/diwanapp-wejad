import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
const ASANA_WORKSPACE_ID = Deno.env.get('ASANA_WORKSPACE_ID')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { portfolioId } = await req.json()

    console.log('Fetching portfolio with ID:', portfolioId)

    if (!portfolioId) {
      console.error('No portfolio ID provided')
      throw new Error('معرف المحفظة مطلوب')
    }

    // First fetch portfolio from database
    const { data: portfolio, error: dbError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    if (!portfolio) {
      console.error('Portfolio not found in database:', portfolioId)
      throw new Error('لم يتم العثور على المحفظة في قاعدة البيانات')
    }

    console.log('Found portfolio in database:', portfolio)

    // If portfolio has Asana integration enabled and has an Asana GID
    if (portfolio.asana_sync_enabled && portfolio.asana_gid) {
      console.log('Fetching portfolio data from Asana:', portfolio.asana_gid)

      try {
        // Fetch portfolio projects from Asana
        const asanaResponse = await fetch(`https://app.asana.com/api/1.0/portfolios/${portfolio.asana_gid}/items`, {
          headers: {
            'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
            'Accept': 'application/json'
          }
        })

        if (!asanaResponse.ok) {
          console.error('Asana API error:', await asanaResponse.text())
          throw new Error('خطأ في الاتصال مع Asana')
        }

        const asanaData = await asanaResponse.json()
        console.log('Successfully fetched Asana portfolio data:', asanaData)

        // Add Asana items to the response
        return new Response(
          JSON.stringify({
            ...portfolio,
            items: asanaData.data
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (asanaError) {
        console.error('Error fetching from Asana:', asanaError)
        throw new Error('حدث خطأ أثناء جلب البيانات من Asana')
      }
    }

    // If no Asana integration, just return the portfolio data
    return new Response(
      JSON.stringify(portfolio),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-portfolio function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب بيانات المحفظة'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})